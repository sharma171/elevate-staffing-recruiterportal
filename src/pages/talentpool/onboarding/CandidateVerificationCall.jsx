import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AgoraRTC from "agora-rtc-sdk-ng";
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
  Clock,
  User,
  Camera,
  Loader2,
  Shield,
  FileText,
  Volume2,
  Info,
} from "lucide-react";
import styles from "./CandidateVerificationCall.module.css";
import MainFooter from "../../../components/Footer/NewMainFooter";
import axios from "axios";

const CandidateVerificationCall = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const channelName = searchParams.get("channel");
  const [stage, setStage] = useState("prejoin");
  const [localTracks, setLocalTracks] = useState({ audio: null, video: null });
  const [remoteUsers, setRemoteUsers] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const [cameras, setCameras] = useState([]);
  const [microphones, setMicrophones] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMicrophone, setSelectedMicrophone] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [previewTrack, setPreviewTrack] = useState(null);
  const [callInfoData, setCallInfoData] = useState({});
  const [isError, setisError] = useState(false);

  const [agoraConfig, setAgoraConfig] = useState({
    appId: "",
    token: null,
    channelName: channelName,
  });

  const [isLoadingToken, setIsLoadingToken] = useState(false);

  const agoraClient = useRef(null);
  const callTimerRef = useRef(null);
  const playedAudioTracks = useRef(new Set());

  useEffect(() => {
    getuserCallInfo();
  }, [channelName]);

  const getuserCallInfo = () => {
    let payload = {
      role: "candidate",
      action: "get-call-info",
      channel_name: channelName,
    };

    axios
      .post("https://send-video-verification-employee-onboarding-v1-305451280005.us-east1.run.app", payload)
      .then((res) => {
        setCallInfoData(res?.data);
      })
      .catch((err) => {
        setisError(true);
        toast.error(err.response?.data?.message || "Verification call not found");
      });
  };

  // Clean up all media resources
  const cleanupMediaResources = async () => {
    try {
      // 1. Stop Agora local tracks
      if (localTracks?.audio) {
        try {
          localTracks.audio.stop();
          localTracks.audio.close();
        } catch (e) {
          console.log("Error stopping audio track:", e);
        }
      }

      if (localTracks?.video) {
        try {
          localTracks.video.stop();
          localTracks.video.close();
        } catch (e) {
          console.log("Error stopping video track:", e);
        }
      }

      setLocalTracks({ audio: null, video: null });

      // 2. Stop preview track (VERY IMPORTANT)
      if (previewTrack) {
        try {
          previewTrack.stop();
          previewTrack.close();
        } catch (e) {
          console.log("Error stopping preview track:", e);
        }
        setPreviewTrack(null);
      }

      // 3. Stop remote user tracks
      Object.values(remoteUsers || {}).forEach((user) => {
        try {
          user?.audioTrack?.stop();
        } catch (e) {
          console.log("Error stopping remote audio:", e);
        }
        try {
          user?.videoTrack?.stop();
        } catch (e) {
          console.log("Error stopping remote video:", e);
        }
      });

      setRemoteUsers({});

      // 4. Leave Agora channel FIRST
      if (agoraClient?.current) {
        try {
          await agoraClient.current.leave();
        } catch (e) {
          console.log("Error leaving Agora channel:", e);
        }
      }

      // 5. Clear timers
      if (callTimerRef?.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }

      // 6. Stop any cached audio tracks
      if (playedAudioTracks?.current) {
        playedAudioTracks.current.forEach((track) => {
          try {
            track.stop();
          } catch (e) {
            console.log("Error stopping cached audio:", e);
          }
        });
        playedAudioTracks.current.clear();
      }

      // 7. HARD STOP ALL MEDIA STREAMS FROM DOM
      if (typeof window !== "undefined") {
        document.querySelectorAll("video, audio").forEach((el) => {
          if (el.srcObject) {
            el.srcObject.getTracks().forEach((track) => {
              try {
                track.stop();
              } catch (e) {
                console.log("Error stopping DOM media:", e);
              }
            });
            el.srcObject = null;
          }
        });
      }

      // 8. FINAL NUCLEAR OPTION — kill any remaining device streams
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });

          stream.getTracks().forEach((track) => {
            track.stop();
          });
        } catch (e) {
          console.log("Error stopping final media streams:", e);
        }
      }
    } catch (error) {
      console.error("Media cleanup failed:", error);
    }
  };

  // Reset to prejoin stage
  const resetToPrejoin = async () => {
    await cleanupMediaResources();
    setStage("prejoin");
    setIsMuted(false);
    setIsVideoOff(false);
    setCallDuration(0);
    setCameras([]);
    setMicrophones([]);
    setSpeakers([]);
    setSelectedCamera("");
    setSelectedMicrophone("");
    setSelectedSpeaker("");
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Agora event handlers
  const handleUserPublished = async (user, mediaType) => {
    if (!agoraClient.current) return;

    try {
      await agoraClient.current.subscribe(user, mediaType);

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
      toast.error("Error connecting to user audio/video");
    }
  };

  const handleUserUnpublished = (user, mediaType) => {
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

  const handleUserLeft = (user) => {
    setRemoteUsers((prev) => {
      const updated = { ...prev };
      delete updated[user.uid];
      return updated;
    });
    toast.info("The verifier has left the call.");
    handleLeaveCall();
  };

  // Agora setup
  useEffect(() => {
    const initAgora = async () => {
      try {
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        agoraClient.current = client;

        // Set up event listeners
        client.on("user-published", handleUserPublished);
        client.on("user-unpublished", handleUserUnpublished);
        client.on("user-left", handleUserLeft);
        client.on("user-joined", (user) => {
          console.log("User joined:", user.uid);
        });

        // Initialize client
        // await client.init("234ac26549db469eb90b6d1ab9ae6a7a");
      } catch (error) {
        console.error("Failed to initialize Agora client:", error);
        // toast.error("Failed to initialize video call system");
      }
    };

    initAgora();

    return () => {
      if (agoraClient.current) {
        agoraClient.current.removeAllListeners();
      }
      cleanupMediaResources();
    };
  }, []);

  // Play remote tracks
  useEffect(() => {
    Object.entries(remoteUsers).forEach(([uid, user]) => {
      if (user.videoTrack) {
        const containerId = `remote-video-${uid}`;
        const container = document.getElementById(containerId);
        if (container && !container.hasChildNodes()) {
          user.videoTrack.play(containerId);
        }
      }

      if (user.audioTrack && !playedAudioTracks.current.has(uid)) {
        try {
          user.audioTrack.play();
          playedAudioTracks.current.add(uid);

          if (selectedSpeaker) {
            const audioElement = user.audioTrack._player?.audioElement;
            if (audioElement && typeof audioElement.setSinkId === "function") {
              audioElement.setSinkId(selectedSpeaker).catch((e) => console.error("Error setting speaker:", e));
            }
          }
        } catch (error) {
          console.error("Error playing audio:", error);
        }
      }
    });

    playedAudioTracks.current.forEach((uid) => {
      if (!remoteUsers[uid]) {
        playedAudioTracks.current.delete(uid);
      }
    });
  }, [remoteUsers, selectedSpeaker]);

  // Play local video
  useEffect(() => {
    if (stage === "incall" && localTracks.video) {
      const container = document.getElementById("local-video");
      if (container && !container.hasChildNodes()) {
        localTracks.video.play("local-video");
      }
    }
  }, [stage, localTracks.video]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!channelName) {
        navigate("/");
      } else {
        // getuserInfo();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [channelName]);

  const getDevices = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      const devices = await navigator.mediaDevices.enumerateDevices();

      const videoDevices = devices
        .filter((d) => d.kind === "videoinput")
        .map((d) => ({ deviceId: d.deviceId, label: d.label || `Camera ${videoDevices.length + 1}` }));

      const audioInputDevices = devices
        .filter((d) => d.kind === "audioinput")
        .map((d) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${audioInputDevices.length + 1}` }));

      const audioOutputDevices = devices
        .filter((d) => d.kind === "audiooutput")
        .map((d) => ({ deviceId: d.deviceId, label: d.label || `Speaker ${audioOutputDevices.length + 1}` }));

      setCameras(videoDevices);
      setMicrophones(audioInputDevices);
      setSpeakers(audioOutputDevices);

      if (videoDevices.length > 0) {
        const firstCamera = videoDevices[0].deviceId;
        setSelectedCamera(firstCamera);
        try {
          const track = await AgoraRTC.createCameraVideoTrack({
            cameraId: firstCamera,
          });
          setPreviewTrack(track);
          track.play("preview-video");
        } catch (error) {
          console.error("Error creating preview track:", error);
          toast.error("Failed to start camera preview");
        }
      }

      if (audioInputDevices.length > 0) {
        setSelectedMicrophone(audioInputDevices[0].deviceId);
      }

      if (audioOutputDevices.length > 0) {
        setSelectedSpeaker(audioOutputDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Error getting devices:", error);
      toast.error("Please allow camera and microphone access to continue.");
    }
  };

  const handleSpeakerChange = (deviceId) => {
    setSelectedSpeaker(deviceId);
    Object.values(remoteUsers).forEach((user) => {
      if (user.audioTrack) {
        const audioElement = user.audioTrack._player?.audioElement;
        if (audioElement && typeof audioElement.setSinkId === "function") {
          audioElement.setSinkId(deviceId).catch((e) => console.error("Error changing speaker:", e));
        }
      }
    });
  };

  const handleStartDeviceCheck = async () => {
    await cleanupMediaResources();
    setStage("devicecheck");
    await getDevices();
  };

  const handleCameraChange = async (deviceId) => {
    setSelectedCamera(deviceId);
    if (previewTrack) {
      previewTrack.stop();
      previewTrack.close();
    }
    try {
      const track = await AgoraRTC.createCameraVideoTrack({ cameraId: deviceId });
      setPreviewTrack(track);
      track.play("preview-video");
    } catch (error) {
      console.error("Error changing camera:", error);
      toast.error("Failed to switch camera");
    }
  };

  const fetchAgoraToken = async () => {
    setIsLoadingToken(true);
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
            role: "candidate",
            action: "get-agora-token",
            requesting_user_email: "marketing@4spheresolutions.com",
            channel_name: channelName || "verify_test_channel",
            user_email: "marketing@4spheresolutions.com",
          }),
        }
      );

      const data = await response.json();
      if (data.app_id && data.token) {
        const config = {
          appId: data.app_id,
          token: data.token,
          channelName: data.channel_name || channelName,
          uid: data.uid ?? 0,
        };
        setAgoraConfig(config);
        return config;
      }
      throw new Error("Invalid token response");
    } catch (error) {
      console.error("Error fetching token:", error);
      toast.error("Failed to connect to the call. Please try again.");
      return null;
    } finally {
      setIsLoadingToken(false);
    }
  };

  const handleJoinCall = async () => {
    if (previewTrack) {
      previewTrack.stop();
      previewTrack.close();
      setPreviewTrack(null);
    }

    setStage("joining");

    const config = await fetchAgoraToken();
    if (!config || !agoraClient.current) {
      setStage("devicecheck");
      return;
    }

    try {
      // Ensure client is initialized
      if (!agoraClient.current) {
        throw new Error("Agora client not initialized");
      }

      let joinUid = config.uid;

      try {
        await agoraClient.current.join(config.appId, config.channelName, config.token, joinUid);
      } catch (error1) {
        console.error("First join attempt failed:", error1);
        if (joinUid !== 0) {
          joinUid = 0;
          try {
            await agoraClient.current.join(config.appId, config.channelName, config.token, joinUid);
          } catch (error2) {
            console.error("Second join attempt failed:", error2);
            joinUid = null;
            await agoraClient.current.join(config.appId, config.channelName, config.token, joinUid);
          }
        } else {
          throw error1;
        }
      }

      // Create and publish tracks
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        microphoneId: selectedMicrophone,
      });
      const videoTrack = await AgoraRTC.createCameraVideoTrack({
        cameraId: selectedCamera,
      });

      setLocalTracks({ audio: audioTrack, video: videoTrack });

      // Publish tracks to the channel
      await agoraClient.current.publish([audioTrack, videoTrack]);

      setStage("incall");

      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      toast.success("You've joined the verification call.");
    } catch (error) {
      console.error("Error joining call:", error);
      toast.error(error.message || "Could not connect to the call.");
      setStage("devicecheck");
    }
  };

  const handleLeaveCall = async () => {
    try {
      await cleanupMediaResources();

      try {
        await fetch("https://send-video-verification-employee-onboarding-v1-305451280005.us-east1.run.app", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "bWFya2V0aW5nQDRzcGhlcmVzb2x1dGlvbnMuY29tOkxvZ2luIzU3ODA=",
          },
          body: JSON.stringify({
            role: "candidate",
            action: "end-verification-call",
            requesting_user_email: "marketing@4spheresolutions.com",
            channel_name: agoraConfig.channelName || channelName,
          }),
        });
      } catch (apiError) {
        console.error("Failed to notify backend:", apiError);
      }

      setStage("completed");
    } catch (error) {
      console.error("Error leaving call:", error);
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

  // Custom Select Component
  const CustomSelect = ({ value, onValueChange, options, placeholder, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.deviceId === value);

    return (
      <div className={styles.selectWrapper} ref={selectRef}>
        <button className={styles.selectTrigger} onClick={() => setIsOpen(!isOpen)} disabled={disabled} type="button">
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <span style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
        </button>
        {isOpen && (
          <div className={styles.selectContent}>
            {options.map((option) => (
              <div
                key={option.deviceId}
                className={`${styles.selectItem} ${option.deviceId === value ? styles.selectItemSelected : ""}`}
                onClick={() => {
                  onValueChange(option.deviceId);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isError) {
    return (
      <div className={`${styles.container} ${styles.bgGradient} pt-5 justify-content-center d-flex`}>
        <div
          className="modal-content"
          style={{
            borderRadius: "14px",
            background: "#ef44441a",
            border: "1px solid #ef44444d",
            color: "#fff",
            maxWidth: "30rem",
            padding: "25px",
            margin: "15px 15px auto 15px",
          }}
        >
          <div className="modal-body text-center px-4 pb-4">
            <div className="d-flex align-items-center justify-content-center mx-auto mb-4">
              <AlertCircle size={60} strokeWidth={3} color="#ef4444" />
            </div>

            <h4 className="fw-bold mb-2 text-white">Call Already Ended</h4>

            <p className="mb-4" style={{ fontSize: "16px", color: "rgba(252,165,165,0.9)" }}>
              This verification call has already ended.
            </p>

            <button
              className="btn"
              onClick={() => navigate("/")}
              style={{
                border: "1px solid rgba(239,68,68,0.4)",
                backgroundColor: "rgba(239,68,68,0.08)",
                color: "#fff",
                borderRadius: 10,
                padding: "8px 22px",
                fontWeight: 600,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.18)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)")}
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "prejoin") {
    // Pre-join screen
    return (
      <>
        <div className={`${styles.container} ${styles.bgGradient}`}>
          <div className={`${styles.centerContainer} ${styles.maxW4xl}`}>
            <div className={`${styles.textCenter} ${styles.mb8}`}>
              <div className={styles.iconContainer}>
                <Shield className={styles.iconXl} style={{ color: "#60a5fa" }} />
              </div>
              <h1 className={`${styles.text3xl} ${styles.textWhite} ${styles.mb2}`} style={{ fontSize: "32px" }}>
                Welcome, {callInfoData?.your_name}!
              </h1>
              <p className={`mt-2 pt-1 ${styles.textSlate400}`} style={{ fontSize: "17px" }}>
                Your verification call with {callInfoData?.other_participant_name}
              </p>

              <div style={{ color: "#60a5fa", fontSize: "18px" }} className="mt-2">
                Scheduled for {callInfoData?.scheduled_at?.formatted_date} at{" "}
                {callInfoData?.scheduled_at?.formatted_time} {callInfoData?.scheduled_at?.timezone}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={`mb-1 ${styles.cardTitle}`}>
                  <FileCheck className={styles.iconLg} style={{ color: "#60a5fa" }} />
                  Have Your Documents Ready
                </h3>
                <p className={styles.cardDescription}>
                  Please have the documents you listed on your I-9 form ready to show during the call
                </p>
              </div>
              <div className={styles.cardContent}>
                <div className={`${styles.spaceY4}`}>
                  <div className={styles.documentSection}>
                    <h4 className={styles.documentTitle}>Acceptable I-9 Documents</h4>
                    <p className={styles.documentSubtitle}>You should have one of these combinations ready:</p>

                    <div className={`${styles.grid} ${styles.gridCols2} ${styles.gap6}`}>
                      <div>
                        <h5 className={`${styles.documentCategory} ${styles.fontSemibold}`}>List A (One document)</h5>
                        <ul className={styles.list}>
                          <li className={styles.listItem}>
                            <CheckCircle2 className={styles.iconMd} style={{ color: "#22c55e" }} />
                            U.S. Passport
                          </li>
                          <li className={styles.listItem}>
                            <CheckCircle2 className={styles.iconMd} style={{ color: "#22c55e" }} />
                            Green Card
                          </li>
                          <li className={styles.listItem}>
                            <CheckCircle2 className={styles.iconMd} style={{ color: "#22c55e" }} />
                            EAD Card
                          </li>
                          <li className={styles.listItem}>
                            <CheckCircle2 className={styles.iconMd} style={{ color: "#22c55e" }} />
                            Foreign Passport with work stamp
                          </li>
                        </ul>
                        <a
                          href="https://www.uscis.gov/i-9-central/form-i-9-acceptable-documents"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.documentLink}
                        >
                          <Info className={styles.iconSm} />
                          Other List A documents accepted
                        </a>
                      </div>

                      <div>
                        <h5
                          className={`${styles.documentCategory} ${styles.documentCategoryBlue} ${styles.fontSemibold}`}
                        >
                          OR List B + List C (Two documents)
                        </h5>
                        <ul className={styles.list}>
                          <li className={styles.listItem}>
                            <CheckCircle2 className={styles.iconMd} style={{ color: "#3b82f6" }} />
                            Driver's License + Social Security Card
                          </li>
                          <li className={styles.listItem}>
                            <CheckCircle2 className={styles.iconMd} style={{ color: "#3b82f6" }} />
                            State ID + Birth Certificate
                          </li>
                          <li className={styles.listItem}>
                            <CheckCircle2 className={styles.iconMd} style={{ color: "#3b82f6" }} />
                            Military ID + Social Security Card
                          </li>
                        </ul>
                        <a
                          href="https://www.uscis.gov/i-9-central/form-i-9-acceptable-documents"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.documentLink}
                        >
                          <Info className={styles.iconSm} />
                          Other List B + C combinations accepted
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className={`${styles.alertBox} ${styles.alertDestructive}`}>
                    <AlertCircle className={styles.iconLg} style={{ color: "#dc2626" }} />
                    <p className={`${styles.textRed300} ${styles.fontMedium}`}>
                      All documents must be unexpired originals. Photos or photocopies are NOT accepted.
                    </p>
                  </div>

                  <div className={`${styles.alertBox} ${styles.alertWarning}`}>
                    <AlertCircle className={styles.iconLg} style={{ color: "#f59e0b" }} />
                    <div>
                      <h4
                        className={`${styles.textYellow400} ${styles.fontMedium} ${styles.mb2}`}
                        style={{ lineHeight: "1" }}
                      >
                        Important Tips
                      </h4>
                      <ul className={styles.list} style={{ color: "#cbd5e1" }}>
                        <li className="mb-1">• Ensure you're in a well-lit area</li>
                        <li className="mb-1">• Have physical documents ready (not photos)</li>
                        <li className="mb-1">• Find a quiet location for the call</li>
                        <li className="mb-1">• This call will be recorded for compliance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.textCenter}>
              <button onClick={handleStartDeviceCheck} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}>
                <Camera className={styles.iconLg} />
                Check Camera & Microphone
              </button>
            </div>
          </div>
        </div>
        <MainFooter />
      </>
    );
  }

  // Device check screen
  if (stage === "devicecheck") {
    return (
      <>
        <div className={`${styles.container} ${styles.bgGradient}`}>
          <div className={`${styles.centerContainer} ${styles.maxW4xl}`}>
            <div className={`${styles.textCenter} ${styles.mb8}`}>
              <h1 className={`${styles.text2xl} ${styles.textWhite} ${styles.mb2}`}>Camera & Microphone Check</h1>
              <p className={styles.textSlate400}>Make sure your devices are working properly</p>
            </div>

            <div className={`${styles.grid} ${styles.gridCols2} ${styles.gap6}`}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Camera Preview</h3>
                </div>
                <div className={styles.cardContent}>
                  <div className={`${styles.videoContainer} ${styles.mb4}`}>
                    <div id="preview-video" className={styles.hFull} />
                    {!previewTrack && (
                      <div className={styles.videoPlaceholder}>
                        <Loader2
                          className={styles.spinner}
                          style={{ width: "32px", height: "32px", color: "#64748b", marginBottom: "12px" }}
                        />
                        <p className={styles.textSlate400}>Loading camera...</p>
                      </div>
                    )}
                  </div>

                  <div className={styles.spaceY4}>
                    <div>
                      <label className={`${styles.formLabel}`}>Camera</label>
                      <CustomSelect
                        value={selectedCamera}
                        onValueChange={handleCameraChange}
                        options={cameras}
                        placeholder="Select camera"
                        disabled={cameras.length === 0}
                      />
                    </div>

                    <div>
                      <label className={`${styles.formLabel}`}>Microphone</label>
                      <CustomSelect
                        value={selectedMicrophone}
                        onValueChange={setSelectedMicrophone}
                        options={microphones}
                        placeholder="Select microphone"
                        disabled={microphones.length === 0}
                      />
                    </div>

                    <div>
                      <label
                        className={`${styles.formLabel} ${styles.flex} ${styles.itemsCenter} ${styles.gap2} gap-2 d-flex align-items-center`}
                      >
                        <Volume2 className={styles.iconMd} />
                        <span> Speaker (Audio Output) </span>
                      </label>
                      <CustomSelect
                        value={selectedSpeaker}
                        onValueChange={handleSpeakerChange}
                        options={speakers}
                        placeholder="Select speaker"
                        disabled={speakers.length === 0}
                      />
                      <p className={styles.formHelp}>Choose where you want to hear the audio</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Ready to Join?</h3>
                </div>
                <div className={`${styles.cardContent} ${styles.spaceY4}`}>
                  <div className={`${styles.flex} ${styles.itemsCenter} ${styles.gap3}`}>
                    {cameras.length > 0 ? (
                      <CheckCircle2 className={styles.iconLg} style={{ color: "#22c55e" }} />
                    ) : (
                      <AlertCircle className={styles.iconLg} style={{ color: "#dc2626" }} />
                    )}
                    <span className={styles.textSlate300}>Camera detected</span>
                  </div>

                  <div className={`${styles.flex} ${styles.itemsCenter} ${styles.gap3}`}>
                    {microphones.length > 0 ? (
                      <CheckCircle2 className={styles.iconLg} style={{ color: "#22c55e" }} />
                    ) : (
                      <AlertCircle className={styles.iconLg} style={{ color: "#dc2626" }} />
                    )}
                    <span className={styles.textSlate300}>Microphone detected</span>
                  </div>

                  <div className={`${styles.flex} ${styles.itemsCenter} ${styles.gap3}`}>
                    {previewTrack ? (
                      <CheckCircle2 className={styles.iconLg} style={{ color: "#22c55e" }} />
                    ) : (
                      <Loader2 className={styles.spinner} style={{ width: "20px", height: "20px", color: "#f59e0b" }} />
                    )}
                    <span className={styles.textSlate300}>Video preview active</span>
                  </div>

                  <div className={styles.separator} />

                  <div
                    className={`${styles.p4} ${styles.roundedLg}`}
                    style={{ backgroundColor: "rgba(30, 41, 59, 0.5)" }}
                  >
                    <h4 className={`${styles.textWhite} ${styles.fontMedium} ${styles.mb2}`}>Reminder</h4>
                    <ul className={styles.list}>
                      <li>• Have your documents ready</li>
                      <li>• Ensure good lighting</li>
                      <li>• Call will be recorded</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleJoinCall}
                    disabled={!previewTrack || isLoadingToken}
                    className={`${styles.btn} ${styles.btnSuccess} ${styles.btnLg} ${styles.wFull}`}
                  >
                    {isLoadingToken ? (
                      <>
                        <Loader2 className={styles.spinner} style={{ width: "20px", height: "20px" }} />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Video className={styles.iconLg} />
                        Join Call
                      </>
                    )}
                  </button>

                  <button onClick={resetToPrejoin} className={`${styles.btn} ${styles.btnGhost} ${styles.wFull}`}>
                    Back to Instructions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <MainFooter />
      </>
    );
  }

  // Joining screen
  if (stage === "joining") {
    return (
      <>
        <div className={styles.joiningScreen}>
          <div className={styles.textCenter}>
            <Loader2
              className={styles.spinner}
              style={{
                width: "64px",
                height: "64px",
                color: "#60a5fa",
                margin: "0 auto 16px",
              }}
            />
            <h2 className={`${styles.text2xl} ${styles.textWhite} ${styles.mb2}`}>Joining Call...</h2>
            <p className={styles.textSlate400}>Please wait while we connect you</p>
          </div>
        </div>
      </>
    );
  }

  // Completed screen
  if (stage === "completed") {
    return (
      <>
        <div className={`${styles.container} ${styles.bgGradient}`}>
          <div className={`${styles.centerContainer} ${styles.maxW2xl} ${styles.textCenter}`}>
            <div className={styles.completedIconContainer}>
              <CheckCircle2 className={styles.icon2xl} style={{ color: "#22c55e" }} />
            </div>
            <h1 className={`${styles.text3xl} ${styles.textWhite} ${styles.mb4}`}>Verification Call Completed</h1>
            <p className={`${styles.textSlate400} ${styles.mb2}`}>
              Thank you for completing the I-9 verification process.
            </p>
            <p className={`${styles.textSlate500} ${styles.mb8}`}>Call duration: {formatDuration(callDuration)}</p>

            <div className={`${styles.card} ${styles.mb8}`}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>What's Next?</h3>
              </div>
              <div className={`${styles.cardContent} ${styles.spaceY3}`}>
                <div className={`${styles.flex} ${styles.itemsStart} ${styles.gap3}`}>
                  <CheckCircle2 className={styles.iconLg} style={{ color: "#22c55e", marginTop: "2px" }} />
                  <span className={styles.textSlate300}>Your documents have been reviewed</span>
                </div>
                <div className={`${styles.flex} ${styles.itemsStart} ${styles.gap3}`}>
                  <Clock className={styles.iconLg} style={{ color: "#f59e0b", marginTop: "2px" }} />
                  <span className={styles.textSlate300}>You'll receive a confirmation email within 24 hours</span>
                </div>
                <div className={`${styles.flex} ${styles.itemsStart} ${styles.gap3}`}>
                  <FileText className={styles.iconLg} style={{ color: "#60a5fa", marginTop: "2px" }} />
                  <span className={styles.textSlate300}>Your I-9 form will be processed and filed</span>
                </div>
              </div>
            </div>

            <button onClick={() => navigate("/")} className={`${styles.btn} ${styles.btnPrimary}`}>
              Return to Dashboard
            </button>
          </div>
        </div>
        <MainFooter />
      </>
    );
  }

  // In-call screen
  return (
    <>
      <div className={`${styles.container} ${styles.bgDark} ${styles.p4}`}>
        <div className={`${styles.maxW6xl} ${styles.mxAuto}`}>
          <div className={`${styles.flex} ${styles.itemsCenter} ${styles.justifyBetween} ${styles.mb4}`}>
            <div className={`${styles.flex} ${styles.itemsCenter} ${styles.gap4}`}>
              <span className={`${styles.badge} ${styles.badgeDestructive} ${styles.badgePulse}`}>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "white",
                    marginRight: "8px",
                  }}
                />
                Recording
              </span>
              <span
                style={{
                  color: "white",
                  fontFamily: "monospace",
                  fontSize: "1.125rem",
                }}
              >
                {formatDuration(callDuration)}
              </span>
            </div>
            <div className={`${styles.flex} ${styles.itemsCenter} ${styles.gap2}`}>
              <Wifi className={styles.iconMd} style={{ color: "#22c55e" }} />
              <span style={{ color: "#4ade80", fontSize: "0.875rem" }}>Connected</span>
            </div>
          </div>

          <div className={`${styles.callGrid}`}>
            <div className={`${styles.videoContainer} ${styles.relative}`}>
              {Object.keys(remoteUsers).length > 0 ? (
                Object.keys(remoteUsers).map((uid) => (
                  <div key={uid} id={`remote-video-${uid}`} className={styles.hFull} />
                ))
              ) : (
                <div className={styles.videoPlaceholder}>
                  <User className={styles.icon2xl} style={{ color: "#475569", marginBottom: "12px" }} />
                  <p className={styles.textSlate400}>Waiting for verifier to join...</p>
                </div>
              )}
              <span
                className={`${styles.badge} ${styles.absolute} ${styles.bottom3} ${styles.left3}`}
                style={{
                  backgroundColor: "#000000b3",
                  color: "white",
                }}
              >
                Verifier
              </span>
            </div>

            <div className={`${styles.videoContainer} ${styles.relative}`}>
              <div id="local-video" className={styles.hFull} />
              <span
                className={`${styles.badge} ${styles.badgeBlue} ${styles.absolute} ${styles.bottom3} ${styles.left3}`}
              >
                You
              </span>
            </div>
          </div>

          <div className={styles.controlsContainer}>
            <button
              onClick={toggleMute}
              className={`${styles.btn} ${styles.btnIconRound}`}
              style={{
                backgroundColor: isMuted ? "#dc2626" : "#334155",
                borderColor: isMuted ? "#dc2626" : "#475569",
              }}
            >
              {isMuted ? (
                <MicOff className={styles.iconLg} style={{ color: "white" }} />
              ) : (
                <Mic className={styles.iconLg} style={{ color: "white" }} />
              )}
            </button>

            <button
              onClick={toggleVideo}
              className={`${styles.btn} ${styles.btnIconRound}`}
              style={{
                backgroundColor: isVideoOff ? "#dc2626" : "#334155",
                borderColor: isVideoOff ? "#dc2626" : "#475569",
              }}
            >
              {isVideoOff ? (
                <VideoOff className={styles.iconLg} style={{ color: "white" }} />
              ) : (
                <Video className={styles.iconLg} style={{ color: "white" }} />
              )}
            </button>

            <button
              onClick={handleLeaveCall}
              className={`${styles.btn} ${styles.btnIconRound}`}
              style={{ backgroundColor: "#475569" }}
            >
              <PhoneOff className={styles.iconLg} style={{ color: "white" }} />
            </button>
          </div>

          <div className={`${styles.mt4} ${styles.alertBox} ${styles.alertInfo} ${styles.roundedXl}`}>
            <div className={`${styles.flex} ${styles.itemsStart} ${styles.gap3}`}>
              <FileCheck className={styles.iconLg} style={{ color: "#60a5fa", marginTop: "2px" }} />
              <div>
                <h4 className={`${styles.textBlue400} ${styles.fontMedium} ${styles.mb2}`}>During the Call</h4>
                <p className={styles.textSlate400}>
                  Hold your documents up to the camera when asked. Make sure they're clearly visible and well-lit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CandidateVerificationCall;
