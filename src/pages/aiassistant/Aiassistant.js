import React, { useEffect, useRef, useState } from "react";
import styles from "./css/Aiassistant.module.css";
import images from "../../assets/images/new";
import api from "../../networking/api";
import { toast } from "react-toastify";
import { Placeholder } from "rsuite";
import { useAuth } from "../../authContext";

const { botIcon } = images;

function renderFormattedText(text) {
  let safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  safeText = safeText.replace(/```(.*?)```/gs, (_, code) => `<pre><code>${code}</code></pre>`);
  safeText = safeText.replace(/`([^`]+)`/g, "<code>$1</code>");
  safeText = safeText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  safeText = safeText.replace(/\*(.*?)\*/g, "<em>$1</em>");

  safeText = safeText.replace(/^###### (.*$)/gim, "<h6>$1</h6>");
  safeText = safeText.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
  safeText = safeText.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
  safeText = safeText.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  safeText = safeText.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  safeText = safeText.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  safeText = safeText.replace(/^\s*[-*] (.*)$/gim, "<ul><li>$1</li></ul>");
  safeText = safeText.replace(/<\/ul>\s*<ul>/gim, "");

  safeText = safeText.replace(/^\s*\d+\. (.*)$/gim, "<ol><li>$1</li></ol>");
  safeText = safeText.replace(/<\/ol>\s*<ol>/gim, "");

  safeText = safeText.replace(/\|(.+?)\|\n\|([-\s|:]+)\|\n((?:\|.+\|\n?)+)/g, (_, headerLine, divider, rowsBlock) => {
    const parseRow = (line) =>
      line
        .trim()
        .split("|")
        .filter((cell) => cell.trim() !== "")
        .map((cell) => cell.trim());

    const headers = parseRow(headerLine)
      .map((h) => `<th>${h}</th>`)
      .join("");
    const rows = rowsBlock
      .trim()
      .split("\n")
      .map((rowLine) => {
        const cells = parseRow(rowLine)
          .map((c) => `<td>${c}</td>`)
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    return `<table class="custom-table-ai"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  return safeText.replace(/\n/g, "<br />");
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

function ChatMessage({ message, isStreaming, loader }) {
  const { role, text = "", timestamp } = message;
  const isUser = role === "user";

  return (
    <div className={`d-flex ${isUser ? "justify-content-end" : ""}`}>
      <div
        className={`d-flex ${
          isUser ? "justify-content-end " + styles.mainmessagecontainerRight : styles.mainmessagecontainer
        }`}
      >
        {!isUser && (
          <div className={styles.profileImageDivMain}>
            <div className={styles.profileImageDiv}>
              <div className={styles.botIconChat}>
                <img src={botIcon} alt="bot" />
              </div>
            </div>
          </div>
        )}
        <div className={styles.messageBoxBG}>
          <div className={`${styles.messageContainer} ${isUser ? styles.rightmsg : ""}`}>
            {loader ? (
              <div style={{ minWidth: "200px" }}>
                <Placeholder.Paragraph active />
              </div>
            ) : (
              <>
                <div
                  className={`d-flex ${isUser ? "" : "justify-content-end"} align-items-center gap-2 mb-2 ${
                    styles.timebox
                  }`}
                >
                  <div>{formatTimeAgo(timestamp)}</div>
                  {!isStreaming && (
                    <span
                      onClick={() => {
                        navigator.clipboard.writeText(text);
                        toast.success("copied to clipboard");
                      }}
                      className="material-symbols-outlined pointer"
                    >
                      content_copy
                    </span>
                  )}
                </div>
                <div className="pe-3" dangerouslySetInnerHTML={{ __html: renderFormattedText(text) }} />
              </>
            )}
          </div>
        </div>
        {isUser && (
          <div className={styles.profileImageDivMainRitht}>
            <div className={styles.profileImageDiv}>
              <div className={styles.userIconChat}>
                <img
                  src="https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg"
                  alt="user Profile"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Aiassistant() {
  const [value, setValue] = useState("");
  const [chats, setChats] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(textarea.scrollHeight, 40)}px`;
    }
  }, [value]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 10;
      setAutoScrollEnabled(isAtBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [chatContainerRef.current]);

  useEffect(() => {
    if (autoScrollEnabled && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats, streamingMessage, autoScrollEnabled]);

  const chatWithAI = () => {
    if (!value.trim()) return;

    const userMessage = {
      role: "user",
      text: value,
      timestamp: new Date().toISOString(),
    };

    setChats((prev) => [...prev, userMessage]);

    setTimeout(() => {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight + 1000;
    }, 300);

    setValue("");

    const payload = {
      text: userMessage.text,
      email_id: user.email,
    };

    setLoading(true);
    api
      .AIAssistant(payload)
      .then((res) => {
        setLoading(false);

        const lines = res
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.startsWith("data:"));

        let currentText = "";
        let index = 0;

        setStreamingMessage({
          role: "ai",
          text: "",
          timestamp: new Date().toISOString(),
        });

        const interval = setInterval(() => {
          if (index >= lines.length) {
            clearInterval(interval);
            return;
          }

          try {
            const json = JSON.parse(lines[index].replace("data: ", ""));
            if (json.content === "[DONE]") {
              const finalMessage = {
                role: "ai",
                text: json.complete_text,
                timestamp: new Date().toISOString(),
              };
              setStreamingMessage(null);
              setChats((prev) => [...prev, finalMessage]);
              clearInterval(interval);
            } else {
              currentText += json.content;
              setStreamingMessage((prev) => ({ ...prev, text: currentText }));
            }
          } catch (e) {}

          index++;
        }, 80);
      })
      .catch((err) => {
        setLoading(false);
        toast.error(String(err?.message || "failed!"));
        console.log(err);
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (e.ctrlKey || e.shiftKey) {
        e.preventDefault();
        const { selectionStart, selectionEnd } = textareaRef.current;
        const newValue = value.substring(0, selectionStart) + "\n" + value.substring(selectionEnd);
        setValue(newValue);
        requestAnimationFrame(() => {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + 1;
        });
      } else {
        e.preventDefault();
        chatWithAI();
      }
    }
  };

  const renderDefaultItems = () => {
    const items = [
      "Correct this email: Dear vendor, we wanted to enquiry about your service.",
      "Write a Professional email to  request meeting with client",
      "Help me summarize this job description  for a candidate ",
      "Create follow up message for  a candidate who  missed a interview",
    ];
    return (
      <div className={`${styles.itemsContainer} mt-3 mb-4`}>
        {items.map((item, index) => (
          <div key={index}>
            <div
              onClick={() => {
                textareaRef.current.focus();
                setValue(item);
              }}
              className={`${styles.defaultItems} align-items-center d-flex gap-1 justify-content-between`}
            >
              <div className={`font14 ${styles.itemText}`}>{item}</div>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                open_in_new
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDefaultView = () => (
    <>
      <div className={styles.mainHeadingsection}>
        <h2>Recruitment Assistant</h2>
        <p className={`font14 mb-2 ${styles.mainHead}`}>
          Ask me anything about recruitment, composing emails, or optimizing your workflow
        </p>
      </div>
      <div className={`${styles.botBox} d-flex align-items-center flex-column justify-content-center my-auto`}>
        <div className={styles.botIcondiv}>
          <img src={botIcon} alt="bot" />
        </div>
        <div className={styles.botheading}>How can I help you today?</div>
        <div className={styles.bottext}>Ask me to draft emails, correct text, or help with recruitment tasks</div>
      </div>
      {renderDefaultItems()}
    </>
  );

  const renderChatsView = () => (
    <div className={styles.allchatBox} ref={chatContainerRef}>
      <div className={`${styles.mainHeadingsection} mb-4`}>
        <h2>Recruitment Assistant</h2>
        <p className="font14">Ask me anything about recruitment, composing emails, or optimizing your workflow</p>
      </div>
      <div className="d-flex flex-column gap-4 pb-3">
        {chats.map((chat, index) => (
          <ChatMessage key={index} message={chat} />
        ))}
        {loading && !streamingMessage && <ChatMessage message={{}} isStreaming loader={loading} />}
        {streamingMessage && <ChatMessage message={streamingMessage} isStreaming />}
      </div>
    </div>
  );

  return (
    <div className={`d-flex backgroundImage w-100 h-100`}>
      <div className={`${styles.whiteBackgroundEffect} d-flex flex-column`}>
        {chats.length || streamingMessage ? renderChatsView() : renderDefaultView()}
        <div
          className={`${chats.length || streamingMessage ? "mt-auto" : "mt-3"} ${
            styles.inputBox
          } d-flex align-items-center justify-content-between gap-2`}
        >
          <textarea
            ref={textareaRef}
            className={`form-control ${styles.chatinput}`}
            placeholder="Ask here for help"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={!!streamingMessage || loading}
          />
          <div className={styles.sendIcon} onClick={!streamingMessage ? chatWithAI : undefined}>
            {streamingMessage || loading ? (
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <span className="send-solid" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Aiassistant;
