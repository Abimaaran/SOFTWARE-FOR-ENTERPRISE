import React, { useEffect, useState, useRef } from "react";
import "./IntroVideo.css";

const IntroVideo = ({ onVideoEnd }) => {
  const [isFading, setIsFading] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted to guarantee autoplay
  const [videoSrc, setVideoSrc] = useState(`/video/intro.mp4?t=${Date.now()}`);
  const videoRef = useRef(null);

  useEffect(() => {
    // Check if the intro has already played in this session
    const hasPlayed = sessionStorage.getItem("introPlayed");
    if (hasPlayed) {
      onVideoEnd();
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    // Guaranteed play (starting muted)
    const playVideo = async () => {
      try {
        await video.play();
        
        // Now try to unmute. Browsers might block this, but we'll try silently.
        try {
          video.muted = false;
          setIsMuted(false);
        } catch (unmuteError) {
          // Stay muted if unmuting is blocked
          video.muted = true;
          setIsMuted(true);
        }
      } catch (playError) {
        // Fallback for extreme cases
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {}); 
      }
    };

    playVideo();

    // Listen for any user interaction to ensure it's unmuted as soon as possible
    const handleFirstInteraction = () => {
      if (video && video.muted) {
        video.muted = false;
        setIsMuted(false);
      }
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [onVideoEnd]);


  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  const handleSkipOrEnd = () => {
    setIsFading(true);
    // Remember that it has played in this session
    sessionStorage.setItem("introPlayed", "true");
    
    // Wait for the fade animation to complete before calling onVideoEnd
    setTimeout(() => {
      onVideoEnd();
    }, 1000); // Should match CSS transition time
  };

  return (
    <div className={`intro-container ${isFading ? "fade-out" : ""}`}>
      <video
        ref={videoRef}
        className="intro-video"
        onEnded={handleSkipOrEnd}
        autoPlay
        playsInline
        muted={isMuted}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className="controls-overlay">
        <button className="icon-btn mute-btn" onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
          {isMuted ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
              <path d="M11 5L6 9H2v6h4l5 4V5zM22 9l-6 6M16 9l6 6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
              <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
        
        <button className="skip-btn" onClick={handleSkipOrEnd}>
          Skip Intro
        </button>
      </div>
    </div>
  );
};

export default IntroVideo;
