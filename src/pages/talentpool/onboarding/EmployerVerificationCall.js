import React, { useState, useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Wifi,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  User,
  Shield,
  FileText,
  Volume2,
  Download,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import styles from "./EmployerVerificationCall.module.css";
import MainFooter from "../../../components/Footer/NewMainFooter";
import axios from "axios";

const EmployerVerificationCall = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get params from URL or use defaults for testing
  const channelName = searchParams.get("channel");

  const [stage, setStage] = useState("prejoin");
  // const [stage, setStage] = useState("incall");
  const [localTracks, setLocalTracks] = useState({ audio: null, video: null });
  const [remoteUsers, setRemoteUsers] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isStartingRecording, setIsStartingRecording] = useState(false);
  const [callInfoData, setCallInfoData] = useState({});

  const [checklist, setChecklist] = useState({
    identityDocument: false,
    workAuthorization: false,
    documentsUnexpired: false,
    photoMatches: false,
    documentsGenuine: false,
    i9Section2Ready: false,
  });
  const [showQuickReference, setShowQuickReference] = useState(false);

  // Select states
  const [showSpeakerSelect, setShowSpeakerSelect] = useState(false);

  // Agora config
  const [agoraConfig, setAgoraConfig] = useState({
    appId: "",
    token: null,
    channelName: channelName,
  });

  const [isLoadingToken, setIsLoadingToken] = useState(false);

  const agoraClient = useRef(null);
  const callTimerRef = useRef(null);

  // Speaker selection
  const [speakers, setSpeakers] = useState([]);
  const [selectedSpeaker, setSelectedSpeaker] = useState("");

  const candidateName = callInfoData?.other_participant_name;
  const candidateEmail = callInfoData?.other_participant_email;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!channelName) {
        navigate("/");
      } else {
        getuserInfo();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [channelName]);

  const getuserInfo = () => {
    let payload = {
      role: "employer",
      action: "get-call-info",
      channel_name: channelName,
    };

    axios
      .post("https://send-video-verification-employee-onboarding-v1-305451280005.us-east1.run.app", payload)
      .then((res) => {
        setCallInfoData(res?.data);
      })
      .catch((err) => {
        setTimeout(() => {
          navigate("/");
        }, 1000);
        toast.error(err.response?.data?.message || "Verification call not found");
      });
  };

  const stopAllActiveMedia = (stream) => {
    document.querySelectorAll("audio, video").forEach((el) => {
      if (el.srcObject && typeof el.srcObject.getTracks === "function") {
        el.srcObject.getTracks().forEach((track) => track.stop());
        el.srcObject = null;
      }
    });

    // Close AudioContext if used
    if (window.AudioContext || window.webkitAudioContext) {
      try {
        const ctx = window.__audioCtx;
        if (ctx && ctx.state !== "closed") {
          ctx.close();
          window.__audioCtx = null;
        }
      } catch (e) {}
    }
  };

  // Get available audio output devices

  const getAudioOutputDevices = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputDevices = devices.filter((d) => d.kind === "audiooutput");

      const speakerList = audioOutputDevices.map((d) => ({
        deviceId: d.deviceId,
        label: d.label || `Speaker ${audioOutputDevices.indexOf(d) + 1}`,
      }));

      setSpeakers(speakerList);

      if (audioOutputDevices.length > 0 && !selectedSpeaker) {
        setSelectedSpeaker(audioOutputDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Error getting audio output devices:", error);
    }
  };

  // Change speaker output
  const handleSpeakerChange = async (deviceId) => {
    setSelectedSpeaker(deviceId);
    setShowSpeakerSelect(false);

    // Update audio output for remote audio tracks
    Object.values(remoteUsers).forEach((user) => {
      if (user.audioTrack) {
        const audioElement = user.audioTrack._player?.audioElement;
        if (audioElement && typeof audioElement.setSinkId === "function") {
          audioElement
            .setSinkId(deviceId)
            .then(() => console.log("Speaker changed successfully"))
            .catch((e) => console.error("Error changing speaker:", e));
        }
      }
    });
  };

  // Get speakers on mount
  useEffect(() => {
    let getmic = async () => {
      await getAudioOutputDevices();
      stopAllActiveMedia();
    };

    getmic();
  }, []);

  // Agora event handlers
  useEffect(() => {
    console.log("Creating Agora client...");
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    agoraClient.current = client;

    const onUserPublished = async (user, mediaType) => {
      console.log("User published:", user.uid, mediaType);
      try {
        await client.subscribe(user, mediaType);

        if (mediaType === "video") {
          setRemoteUsers((prev) => ({
            ...prev,
            [user.uid]: { ...prev[user.uid], videoTrack: user.videoTrack },
          }));
        }

        if (mediaType === "audio") {
          setRemoteUsers((prev) => ({
            ...prev,
            [user.uid]: { ...prev[user.uid], audioTrack: user.audioTrack },
          }));
          if (user.audioTrack) {
            user.audioTrack.play();
          }
        }
      } catch (error) {
        console.error("Error subscribing to user:", error);
      }
    };

    const onUserUnpublished = (user, mediaType) => {
      if (mediaType === "video") {
        setRemoteUsers((prev) => {
          const updated = { ...prev };
          if (updated[user.uid]) {
            delete updated[user.uid].videoTrack;
          }
          return updated;
        });
      }
    };

    const onUserLeft = (user) => {
      setRemoteUsers((prev) => {
        const updated = { ...prev };
        delete updated[user.uid];
        return updated;
      });
      toast.error("The candidate has left the call.");
    };

    client.on("user-published", onUserPublished);
    client.on("user-unpublished", onUserUnpublished);
    client.on("user-left", onUserLeft);

    return () => {
      client.removeAllListeners();
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  const playedAudioTracks = useRef(new Set());

  // Play remote video and audio tracks
  useEffect(() => {
    Object.entries(remoteUsers).forEach(([uid, user]) => {
      // Handle video
      if (user.videoTrack) {
        const containerId = `remote-video-${uid}`;
        const container = document.getElementById(containerId);
        if (container && !container.hasChildNodes()) {
          user.videoTrack.play(containerId);
        }
      }

      // Handle audio
      if (user.audioTrack && !playedAudioTracks.current.has(uid)) {
        try {
          user.audioTrack.play();
          playedAudioTracks.current.add(uid);

          // Apply selected speaker if available
          if (selectedSpeaker) {
            const audioElement = user.audioTrack._player?.audioElement;
            if (audioElement && typeof audioElement.setSinkId === "function") {
              audioElement
                .setSinkId(selectedSpeaker)
                .then(() => console.log("Speaker set"))
                .catch((e) => console.error("Error setting speaker:", e));
            }
          }
        } catch (error) {
          console.error("Error playing audio track:", error);
        }
      }
    });

    // Clean up played tracks for users who left
    playedAudioTracks.current.forEach((uid) => {
      if (!remoteUsers[uid]) {
        playedAudioTracks.current.delete(uid);
      }
    });
  }, [remoteUsers, selectedSpeaker]);

  // Play local video when stage changes to incall
  useEffect(() => {
    if (stage === "incall" && localTracks.video) {
      const container = document.getElementById("local-video");
      if (container && !container.hasChildNodes()) {
        localTracks.video.play("local-video");
      }
    }
  }, [stage, localTracks.video]);

  const [callEndedError, setCallEndedError] = useState(null);

  const fetchAgoraToken = async () => {
    setIsLoadingToken(true);
    setCallEndedError(null);
    try {
      const response = await fetch(
        "https://send-video-verification-employee-onboarding-v1-305451280005.us-east1.run.app",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: "employer",
            action: "get-agora-token",
            channel_name: channelName,
          }),
        }
      );

      const data = await response.json();

      // Check if call has already ended
      if (data.call_ended || data.call_status === "completed") {
        setCallEndedError(data.message || "This verification call has already ended.");
        toast.error(data.message || "This verification call has already ended.");
        return null;
      }

      if (data.app_id && data.token) {
        const uid = data.uid ?? 0;
        const config = {
          appId: data.app_id,
          token: data.token,
          channelName: data.channel_name || channelName,
          uid,
        };
        setAgoraConfig(config);
        return config;
      }
      throw new Error(data.message || "Invalid token response");
    } catch (error) {
      console.error("Error fetching Agora token:", error);
      toast.error(error.message || "Failed to get video call credentials.");
      stopAllActiveMedia();
      return null;
    } finally {
      setIsLoadingToken(false);
    }
  };

  const handleJoinCall = async () => {
    await getAudioOutputDevices();

    setStage("joining");

    const config = await fetchAgoraToken();
    if (!config || !agoraClient.current) {
      setStage("prejoin");
      return;
    }

    try {
      // Join channel
      let joinUid = config.uid;
      try {
        await agoraClient.current.join(config.appId, config.channelName, config.token, joinUid);
      } catch (error1) {
        console.error("Agora join failed:", error1);
        if (joinUid !== 0) {
          joinUid = 0;
          try {
            await agoraClient.current.join(config.appId, config.channelName, config.token, joinUid);
          } catch (error2) {
            console.error("Agora join failed with uid=0:", error2);
            joinUid = null;
            await agoraClient.current.join(config.appId, config.channelName, config.token, joinUid);
          }
        } else {
          throw error1;
        }
      }

      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();

      setLocalTracks({ audio: audioTrack, video: videoTrack });
      await agoraClient.current.publish([audioTrack, videoTrack]);

      setStage("incall");

      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      toast.success("You've joined the verification call.");
    } catch (error) {
      console.error("Error joining call:", error);
      toast.error(error.message || "Could not connect to the call.");
      setStage("prejoin");
    }
  };

  const handleLeaveCall = async () => {
    try {
      // Clean up Agora connection
      if (localTracks.audio) {
        localTracks.audio.stop();
        localTracks.audio.close();
      }
      if (localTracks.video) {
        localTracks.video.stop();
        localTracks.video.close();
      }

      await agoraClient.current?.leave();

      setLocalTracks({ audio: null, video: null });
      setRemoteUsers({});

      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }

      // Notify backend
      try {
        await fetch("https://send-video-verification-employee-onboarding-v1-305451280005.us-east1.run.app", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=",
          },
          body: JSON.stringify({
            role: "employer",
            action: "end-verification-call",
            channel_name: agoraConfig.channelName || channelName,
          }),
        });
      } catch (apiError) {
        console.error("Failed to notify backend:", apiError);
      }

      toast.info("Left call. You can rejoin using the same link.");
      setStage("prejoin");
    } catch (error) {
      console.error("Error leaving call:", error);
      setStage("prejoin");
    }
  };

  const handleCompleteVerification = async () => {
    if (!window?.confirm("Are you sure? This will end the call for everyone and cannot be undone.")) {
      return;
    }

    try {
      // Clean up Agora connection
      if (localTracks.audio) {
        localTracks.audio.stop();
        localTracks.audio.close();
      }
      if (localTracks.video) {
        localTracks.video.stop();
        localTracks.video.close();
      }

      await agoraClient.current?.leave();

      setLocalTracks({ audio: null, video: null });
      setRemoteUsers({});

      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }

      // Call backend to complete verification
      try {
        await fetch("https://send-video-verification-employee-onboarding-v1-305451280005.us-east1.run.app", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=",
          },
          body: JSON.stringify({
            role: "employer",
            action: "complete-verification",
            channel_name: agoraConfig.channelName || channelName,
          }),
        });
      } catch (apiError) {
        console.error("Failed to complete verification:", apiError);
      }

      setStage("completed");
    } catch (error) {
      console.error("Error completing verification:", error);
      setStage("completed");
    }
  };

  const toggleMute = () => {
    if (localTracks.audio) {
      localTracks.audio.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localTracks.video) {
      localTracks.video.setEnabled(isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleStartRecording = async () => {
    setIsStartingRecording(true);
    try {
      const response = await fetch(
        "https://send-video-verification-employee-onboarding-v1-305451280005.us-east1.run.app",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: "employer",
            action: "start-recording",
            channel_name: agoraConfig.channelName || channelName,
          }),
        }
      );

      const result = await response.json();

      if (result.is_recording) {
        setIsRecording(true);
        toast.success("The call is now being recorded.");
      } else if (result.message) {
        toast.info(result.message);
        if (result.message.includes("already")) {
          setIsRecording(true);
        }
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to start recording.");
    } finally {
      setIsStartingRecording(false);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadRecording = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(
        "https://send-video-verification-employee-onboarding-v1-305451280005.us-east1.run.app",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=",
          },
          body: JSON.stringify({
            role: "employer",
            action: "get-recording-url",
            channel_name: agoraConfig.channelName || channelName,
            expiration_minutes: 60,
          }),
        }
      );

      const data = await response.json();

      if (data.status === "success" && data.download_url) {
        window.open(data.download_url, "_blank");
        toast.success(`Recording downloaded for ${candidateName}`);
      } else {
        toast.error(data.message || "No recording available.");
      }
    } catch (error) {
      console.error("Failed to get recording URL:", error);
      toast.error("Failed to download recording.");
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const allChecked = Object.values(checklist).every((v) => v);

  // Pre-join screen
  if (stage === "prejoin") {
    return (
      <>
        <div className={styles.container}>
          <div className={styles.maxContainer}>
            <div className={`${styles.textCenter} ${styles.mb8}`}>
              <div
                className={`${styles.flex} ${styles.itemsCenter} ${styles.justifyCenter}`}
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "#7c3bed33",
                  margin: "0 auto 16px",
                }}
              >
                <Shield className={styles.iconXl} style={{ color: "#7c3bed" }} />
              </div>
              <h1
                className={`${styles.textWhite}`}
                style={{ fontSize: "1.9rem", fontWeight: "bold", marginBottom: "8px", lineHeight: "1" }}
              >
                Welcome, {callInfoData?.your_name}!
              </h1>
              <p className={styles.textMuted}>Employer Verification Portal</p>
              <p style={{ color: "#7c3bed", fontSize: "16px", fontWeight: "500" }}>
                {" "}
                Scheduled for {callInfoData?.scheduled_at?.formatted_date} at{" "}
                {callInfoData?.scheduled_at?.formatted_time} {callInfoData?.scheduled_at?.timezone}
              </p>
            </div>

            {/* Call Ended Error Message */}
            {callEndedError && (
              <div className={`${styles.alert} ${styles.alertDestructive} ${styles.mb6}`}>
                <div className={`${styles.flex} ${styles.itemsCenter} ${styles.gap3}`}>
                  <AlertCircle className={styles.iconLg} style={{ color: "#ef4444" }} />
                  <div>
                    <p style={{ color: "#fca5a5", fontWeight: 500, marginBottom: "4px" }}>Call Already Ended</p>
                    <p style={{ color: "#fecaca", fontSize: "0.875rem" }}>{callEndedError}</p>
                  </div>
                </div>
                <div className={`${styles.flex} ${styles.gap3} ${styles.mt4}`} style={{ flexWrap: "wrap" }}>
                  <button
                    onClick={handleDownloadRecording}
                    disabled={isDownloading}
                    className={`${styles.button} ${styles.buttonOutline} ${styles.buttonSm}`}
                    style={{ borderColor: "rgba(239, 68, 68, 0.3)", color: "#fca5a5" }}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className={`${styles.iconSm} ${styles.spin}`} style={{ marginRight: "8px" }} />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className={styles.iconSm} style={{ marginRight: "8px" }} />
                        Download Recording
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate("/availableTalent")}
                    className={`${styles.button} ${styles.buttonOutline} ${styles.buttonSm}`}
                    style={{ borderColor: "rgba(239, 68, 68, 0.3)", color: "#fca5a5" }}
                  >
                    Back to Candidates
                  </button>
                </div>
              </div>
            )}

            <div className={styles.grid2}>
              {/* Candidate Info Card */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={`${styles.cardTitle} ${styles.flex} ${styles.itemsCenter} ${styles.gap2}`}>
                    <User className={styles.iconMd} />
                    Candidate Information
                  </h3>
                </div>
                <div
                  className={`pt-2 ${styles.cardContent}`}
                  style={{ fontSize: "16px", display: "flex", flexDirection: "column", gap: "16px" }}
                >
                  <div>
                    <p className={styles.textSm} style={{ color: "#94a3b8" }}>
                      Name
                    </p>
                    <p className={`mt-1 ${styles.textWhite}`} style={{ fontWeight: 500 }}>
                      {candidateName}
                    </p>
                  </div>
                  <div>
                    <p className={styles.textSm} style={{ color: "#94a3b8" }}>
                      Email
                    </p>
                    <p className={`mt-1 ${styles.textWhite}`} style={{ fontWeight: 500 }}>
                      {candidateEmail}
                    </p>
                  </div>
                  <div
                    className={`${styles.flex} ${styles.itemsCenter} ${styles.gap2}`}
                    style={{ fontSize: "0.875rem" }}
                  >
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }} />
                    <span style={{ color: "#f59e0b" }}>Waiting for candidate to join</span>
                  </div>
                </div>
              </div>

              {/* Pre-call Checklist */}
              <div className={styles.card}>
                <div className={`${styles.cardHeader}`}>
                  <h3 className={`${styles.cardTitle} ${styles.flex} ${styles.itemsCenter} ${styles.gap2}`}>
                    <FileCheck className={styles.iconMd} />
                    Pre-Call Checklist
                  </h3>
                </div>
                <div
                  className={`pt-2 ${styles.cardContent}`}
                  style={{ fontSize: "16px", display: "flex", flexDirection: "column", gap: "12px" }}
                >
                  {[
                    "Camera ready",
                    "Microphone ready",
                    "Stable internet connection",
                    "I-9 Form ready for reference",
                    "Acceptable documents list available",
                  ].map((item, index) => (
                    <div key={index} className={`${styles.flex} ${styles.itemsCenter} ${styles.gap3}`}>
                      <CheckCircle2 className={styles.iconMd} style={{ color: "#10b981" }} />
                      <span style={{ color: "#cbd5e1" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Speaker Selection */}
            <div className={`${styles.card} ${styles.mt6}`}>
              <div className={styles.cardHeader} style={{ paddingBottom: "12px" }}>
                <h3
                  className={`${styles.textWhite} ${styles.flex} ${styles.itemsCenter} ${styles.gap2}`}
                  style={{ fontSize: "1.125rem" }}
                >
                  <Volume2 className={styles.iconMd} />
                  Audio Output (Speaker)
                </h3>
                <p className={styles.textMuted} style={{ fontSize: "0.875rem", marginTop: "4px" }}>
                  Choose where you want to hear the candidate's audio
                </p>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.selectContainer}>
                  <div
                    className={styles.selectTrigger}
                    onClick={() => setShowSpeakerSelect(!showSpeakerSelect)}
                    style={{ cursor: "pointer" }}
                  >
                    <span>{speakers.find((s) => s.deviceId === selectedSpeaker)?.label || "Select speaker"}</span>
                    {showSpeakerSelect ? (
                      <ChevronUp className={styles.iconSm} />
                    ) : (
                      <ChevronDown className={styles.iconSm} />
                    )}
                  </div>

                  {showSpeakerSelect && (
                    <div className={styles.selectContent}>
                      {speakers.length > 0 ? (
                        speakers.map((speaker) => (
                          <div
                            key={speaker.deviceId}
                            className={styles.selectItem}
                            onClick={() => handleSpeakerChange(speaker.deviceId)}
                            style={{
                              background: selectedSpeaker === speaker.deviceId ? "#334155" : "transparent",
                            }}
                          >
                            {speaker.label}
                          </div>
                        ))
                      ) : (
                        <div className={styles.selectItem} style={{ color: "#94a3b8", cursor: "default" }}>
                          Loading speakers...
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className={styles.textXs} style={{ color: "#64748b", marginTop: "8px" }}>
                  If you're using an HDMI monitor, select your actual speakers instead
                </p>
              </div>
            </div>

            <div className={`${styles.textCenter} ${styles.mt8}`}>
              <button
                onClick={handleJoinCall}
                disabled={isLoadingToken || !!callEndedError}
                className={`${styles.button} ${styles.buttonLg}`}
                style={{
                  background: isLoadingToken || callEndedError ? "#4b5563" : "#16a34a",
                  color: "white",
                  padding: "16px 32px",
                  opacity: isLoadingToken || callEndedError ? 0.5 : 1,
                  cursor: isLoadingToken || callEndedError ? "not-allowed" : "pointer",
                }}
              >
                {isLoadingToken ? (
                  <>
                    <Loader2 className={`${styles.iconLg} ${styles.spin}`} style={{ marginRight: "8px" }} />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Video className={styles.iconLg} style={{ marginRight: "8px" }} />
                    Join Verification Call
                  </>
                )}
              </button>
              {!callEndedError && (
                <p className={`${styles.textSm} ${styles.textMuted} ${styles.mt3}`}>
                  Call will be recorded for compliance purposes
                </p>
              )}
            </div>
          </div>
        </div>{" "}
        <MainFooter />{" "}
      </>
    );
  }

  // Joining screen
  if (stage === "joining") {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.textCenter}>
          <Loader2 className={`${styles.icon2xl} ${styles.spin}`} style={{ color: "#3b82f6", margin: "0 auto 16px" }} />
          <h2 className={`${styles.textWhite}`} style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "8px" }}>
            Connecting to Call...
          </h2>
          <p className={styles.textMuted}>Please allow camera and microphone access</p>
        </div>
      </div>
    );
  }

  // Completed screen
  if (stage === "completed") {
    return (
      <>
        <div className={styles.container}>
          <div className={styles.maxContainer} style={{ maxWidth: "800px" }}>
            <div className={styles.textCenter}>
              <div
                className={`${styles.flex} ${styles.itemsCenter} ${styles.justifyCenter}`}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.2)",
                  margin: "0 auto 24px",
                }}
              >
                <CheckCircle2 className={styles.icon2xl} style={{ color: "#10b981" }} />
              </div>
              <h1
                className={`${styles.textWhite}`}
                style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "16px" }}
              >
                Verification Call Completed
              </h1>
              <p className={`${styles.textMuted} ${styles.mb8}`}>Call duration: {formatDuration(callDuration)}</p>

              <div className={`${styles.card} ${styles.mb8}`} style={{ textAlign: "left" }}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.textWhite} style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                    Documents Verified
                  </h3>
                </div>
                <div className={styles.cardContent} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { key: "identityDocument", label: "Identity Document Verified" },
                    { key: "workAuthorization", label: "Work Authorization Verified" },
                    { key: "documentsUnexpired", label: "Documents Are Unexpired" },
                    { key: "photoMatches", label: "Photo Matches Person" },
                    { key: "documentsGenuine", label: "Documents Appear Genuine" },
                    { key: "i9Section2Ready", label: "I-9 Section 2 Ready" },
                  ].map(({ key, label }) => (
                    <div key={key} className={`${styles.flex} ${styles.itemsCenter} ${styles.gap3}`}>
                      {checklist[key] ? (
                        <CheckCircle2 className={styles.iconMd} style={{ color: "#10b981" }} />
                      ) : (
                        <AlertCircle className={styles.iconMd} style={{ color: "#ef4444" }} />
                      )}
                      <span style={checklist[key] ? { color: "#cbd5e1" } : { color: "#fca5a5" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* <div className={`${styles.flex} ${styles.gap4} ${styles.justifyCenter}`} style={{ flexWrap: "wrap" }}>
              <button
                onClick={handleDownloadRecording}
                disabled={isDownloading}
                className={`${styles.button} ${styles.buttonOutline} ${styles.buttonMd}`}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className={`${styles.iconSm} ${styles.spin}`} style={{ marginRight: "8px" }} />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className={styles.iconSm} style={{ marginRight: "8px" }} />
                    Download Recording
                  </>
                )}
              </button>
              <button
                onClick={() => navigate("/employer/candidates")}
                className={`${styles.button} ${styles.buttonOutline} ${styles.buttonMd}`}
              >
                Back to Candidates
              </button>
              <button className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonMd}`}>
                <FileText className={styles.iconSm} style={{ marginRight: "8px" }} />
                Complete I-9 Form
              </button>
            </div> */}
            </div>
          </div>
        </div>
        <MainFooter />
      </>
    );
  }

  // In-call screen
  return (
    <>
      <div className={styles.callContainer}>
        {/* Main Video Area */}
        <div className={styles.callMain}>
          {/* Header */}
          <div className={`${styles.flex} ${styles.itemsCenter} ${styles.justifyBetween} ${styles.mb4}`}>
            <div className={`${styles.flex} ${styles.itemsCenter} ${styles.gap4}`}>
              {isRecording ? (
                <span className={`${styles.badge} ${styles.badgeDestructive} ${styles.pulse}`}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "white",
                      marginRight: "8px",
                    }}
                  />
                  REC
                </span>
              ) : (
                <span className={`${styles.badge} ${styles.badgeSecondary}`}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#94a3b8",
                      marginRight: "8px",
                    }}
                  />
                  Not Recording
                </span>
              )}
              <span className={`${styles.textWhite}`} style={{ fontFamily: "monospace", fontSize: "1rem" }}>
                {formatDuration(callDuration)}
              </span>
            </div>
            <div className={`${styles.flex} ${styles.itemsCenter} ${styles.gap2}`}>
              <Wifi className={styles.iconSm} style={{ color: "#10b981" }} />
              <span style={{ color: "#10b981", fontSize: "0.875rem" }}>Connected</span>
            </div>
          </div>

          {/* Video Grid */}
          <div className={`${styles.videoGrid} ${styles.mb4}`}>
            {/* Remote Video (Candidate) */}
            <div className={styles.videoContainer}>
              {Object.keys(remoteUsers).length > 0 ? (
                Object.keys(remoteUsers).map((uid) => (
                  <div
                    key={uid}
                    id={`remote-video-${uid}`}
                    style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
                  />
                ))
              ) : (
                <div
                  className={`${styles.flex} ${styles.itemsCenter} ${styles.justifyCenter}`}
                  style={{ height: "100%", minHeight: "300px" }}
                >
                  <div className={styles.textCenter}>
                    <User className={styles.icon2xl} style={{ color: "#475569", margin: "0 auto 12px" }} />
                    <p className={styles.textMuted}>Waiting for {candidateName}...</p>
                    <p className={styles.textXs} style={{ color: "#64748b", marginTop: "8px" }}>
                      Remote users: {Object.keys(remoteUsers).length}
                    </p>
                  </div>
                </div>
              )}
              <span
                className={styles.badge}
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "12px",
                  background: "rgba(0, 0, 0, 0.7)",
                  color: "#e2e8f0",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              >
                {candidateName} (Candidate)
              </span>
            </div>

            {/* Local Video (Employer) */}
            <div className={styles.videoContainer}>
              <div id="local-video" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />
              <span
                className={styles.badge}
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "12px",
                  background: "rgba(59, 130, 246, 0.8)",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              >
                You (Verifier)
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <button
              onClick={toggleMute}
              className={styles.controlButton}
              style={{ background: isMuted ? "#ef4444" : "#475569" }}
            >
              {isMuted ? <MicOff className={styles.iconLg} /> : <Mic className={styles.iconLg} />}
            </button>

            <button
              onClick={toggleVideo}
              className={styles.controlButton}
              style={{ background: isVideoOff ? "#ef4444" : "#475569" }}
            >
              {isVideoOff ? <VideoOff className={styles.iconLg} /> : <Video className={styles.iconLg} />}
            </button>

            <button
              onClick={handleLeaveCall}
              className={styles.controlButton}
              style={{ background: "#475569" }}
              title="Leave Call (can rejoin)"
            >
              <PhoneOff className={styles.iconLg} />
            </button>
          </div>
        </div>

        {/* Sidebar - Document Checklist */}
        <div className={styles.sidebar}>
          <h3
            className={`${styles.textWhite} ${styles.mb4} ${styles.flex} ${styles.itemsCenter} ${styles.gap2}`}
            style={{ fontWeight: 600, fontSize: "1.125rem" }}
          >
            <FileCheck className={styles.iconMd} />
            Document Verification Checklist
          </h3>

          <div className={`${styles.flex} ${styles.flexCol} ${styles.gap3}`}>
            {[
              {
                id: "identity",
                key: "identityDocument",
                label: "Identity Document Presented",
                description: "List A or List B document",
              },
              {
                id: "workAuth",
                key: "workAuthorization",
                label: "Work Authorization Verified",
                description: "List A or List C document",
              },
              {
                id: "unexpired",
                key: "documentsUnexpired",
                label: "Documents Are Unexpired",
                description: "Check expiration dates",
              },
              {
                id: "photoMatch",
                key: "photoMatches",
                label: "Photo Matches Person on Video",
                description: "Visual identity confirmation",
              },
              {
                id: "genuine",
                key: "documentsGenuine",
                label: "Documents Appear Genuine",
                description: "No signs of tampering or alteration",
              },
            ].map((item) => (
              <div key={item.id} className={styles.checkboxContainer}>
                <div
                  className={`${styles.checkbox} ${checklist[item.key] ? styles.checkboxChecked : ""}`}
                  onClick={() => setChecklist((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                />
                <div>
                  <label className={`${styles.textWhite}`} style={{ fontWeight: 500, cursor: "pointer" }}>
                    {item.label}
                  </label>
                  <p className={`${styles.textXs} ${styles.textMuted}`}>{item.description}</p>
                </div>
              </div>
            ))}

            <div className={styles.divider} />

            <div className={styles.checkboxContainer}>
              <div
                className={`${styles.checkbox} ${checklist.i9Section2Ready ? styles.checkboxChecked : ""}`}
                onClick={() => setChecklist((prev) => ({ ...prev, i9Section2Ready: !prev.i9Section2Ready }))}
              />
              <div>
                <label className={`${styles.textWhite}`} style={{ fontWeight: 500, cursor: "pointer" }}>
                  I-9 Section 2 Ready to Complete
                </label>
                <p className={`${styles.textXs} ${styles.textMuted}`}>Form prepared with document info</p>
              </div>
            </div>
          </div>

          {/* Quick Reference - Collapsible */}
          <div className={styles.referencePanel}>
            <button onClick={() => setShowQuickReference(!showQuickReference)} className={styles.referenceHeader}>
              <span className={`${styles.textWhite} ${styles.textSm}`} style={{ fontWeight: 500 }}>
                Acceptable Documents Reference
              </span>
              {showQuickReference ? <ChevronUp className={styles.iconSm} /> : <ChevronDown className={styles.iconSm} />}
            </button>
            {showQuickReference && (
              <div className={styles.referenceContent}>
                <div style={{ marginBottom: "12px" }}>
                  <h5 style={{ color: "#34d399", fontWeight: 600, marginBottom: "4px", fontSize: "0.75rem" }}>
                    List A (Identity + Work Auth)
                  </h5>
                  <ul style={{ color: "#94a3b8", fontSize: "0.75rem", listStyle: "none", padding: 0, margin: 0 }}>
                    <li>• U.S. Passport / Passport Card</li>
                    <li>• Permanent Resident Card</li>
                    <li>• EAD (I-766)</li>
                    <li>• Foreign Passport with I-94</li>
                  </ul>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <h5 style={{ color: "#60a5fa", fontWeight: 600, marginBottom: "4px", fontSize: "0.75rem" }}>
                    List B (Identity Only)
                  </h5>
                  <ul style={{ color: "#94a3b8", fontSize: "0.75rem", listStyle: "none", padding: 0, margin: 0 }}>
                    <li>• Driver's License</li>
                    <li>• State/Federal ID</li>
                    <li>• School ID with photo</li>
                    <li>• Military ID</li>
                  </ul>
                </div>
                <div>
                  <h5 style={{ color: "#c084fc", fontWeight: 600, marginBottom: "4px", fontSize: "0.75rem" }}>
                    List C (Work Auth Only)
                  </h5>
                  <ul style={{ color: "#94a3b8", fontSize: "0.75rem", listStyle: "none", padding: 0, margin: 0 }}>
                    <li>• Social Security Card (unrestricted)</li>
                    <li>• U.S. Birth Certificate</li>
                    <li>• Certification of Birth Abroad</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {allChecked && (
            <div
              className={styles.mt6}
              style={{
                padding: "16px",
                background: "rgba(16, 185, 129, 0.2)",
                borderRadius: "8px",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              <div className={`${styles.flex} ${styles.itemsCenter} ${styles.gap2}`} style={{ color: "#34d399" }}>
                <CheckCircle2 className={styles.iconMd} />
                <span style={{ fontWeight: 500 }}>All documents verified</span>
              </div>
            </div>
          )}

          <div className={styles.mt6}>
            {/* Start Recording Button - only show if not recording */}
            {!isRecording && (
              <>
                <button
                  onClick={handleStartRecording}
                  disabled={isStartingRecording}
                  className={`${styles.button} ${styles.wFull} ${styles.mb2}`}
                  style={{
                    background: "#dc2626",
                    color: "white",
                    padding: "10px 20px",
                    opacity: isStartingRecording ? 0.5 : 1,
                    cursor: isStartingRecording ? "not-allowed" : "pointer",
                  }}
                >
                  {isStartingRecording ? (
                    <>
                      <Loader2 className={`${styles.iconSm} ${styles.spin}`} style={{ marginRight: "8px" }} />
                      Starting...
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: "white",
                          marginRight: "8px",
                        }}
                      />
                      Start Recording
                    </>
                  )}
                </button>
                <p className={`${styles.textXs} ${styles.mb4} ${styles.textCenter}`} style={{ color: "#f59e0b" }}>
                  Start recording before verification
                </p>
              </>
            )}

            {/* Recording indicator */}
            {isRecording && (
              <div
                className={styles.mb4}
                style={{
                  padding: "12px",
                  background: "rgba(239, 68, 68, 0.2)",
                  borderRadius: "8px",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                <div className={`${styles.flex} ${styles.itemsCenter} ${styles.gap2}`}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ef4444" }} />
                  <span style={{ color: "#fca5a5", fontSize: "0.875rem", fontWeight: 500 }}>Recording in progress</span>
                </div>
              </div>
            )}

            <button
              onClick={handleLeaveCall}
              className={`${styles.button} ${styles.buttonOutline} ${styles.wFull} ${styles.mb2}`}
              style={{ padding: "10px 20px" }}
            >
              <PhoneOff className={styles.iconSm} style={{ marginRight: "8px" }} />
              Leave Call
            </button>
            <p className={`${styles.textXs} ${styles.textCenter} ${styles.mb4}`} style={{ color: "#64748b" }}>
              Can rejoin later
            </p>

            <button
              onClick={handleCompleteVerification}
              className={`${styles.button} ${styles.wFull}`}
              style={{
                background: allChecked && isRecording ? "#3b82f6" : "#475569",
                color: "white",
                padding: "10px 20px",
                opacity: !allChecked || !isRecording ? 0.5 : 1,
                cursor: !allChecked || !isRecording ? "not-allowed" : "pointer",
              }}
              disabled={!allChecked || !isRecording}
            >
              <CheckCircle2 className={styles.iconSm} style={{ marginRight: "8px" }} />
              Complete Verification
            </button>
            {!allChecked && (
              <p className={`${styles.textXs} ${styles.textCenter} ${styles.mt2}`} style={{ color: "#f59e0b" }}>
                Complete checklist to enable
              </p>
            )}
            {allChecked && !isRecording && (
              <p className={`${styles.textXs} ${styles.textCenter} ${styles.mt2}`} style={{ color: "#f59e0b" }}>
                Start recording first
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployerVerificationCall;
