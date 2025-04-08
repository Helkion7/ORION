import { useState, useEffect, useRef } from "react";
import "./BootSequence.css";
import startupSound from "../../assets/sounds/win98-startup.mp3";
import biosBeep from "../../assets/sounds/bios-beep.mp3";
import diskSound from "../../assets/sounds/disk-access.mp3";

const BootSequence = ({ onComplete }) => {
  const [bootStage, setBootStage] = useState("bios");
  const [showOverlay, setShowOverlay] = useState(true);
  const [progress, setProgress] = useState(0);
  const startupSoundRef = useRef(null);
  const biosBeepRef = useRef(null);
  const diskSoundRef = useRef(null);

  useEffect(() => {
    // Check if the user has already seen the boot sequence
    const hasSeenBoot = sessionStorage.getItem("hasSeenBootSequence");

    if (hasSeenBoot) {
      setShowOverlay(false);
      if (onComplete) onComplete();
      return;
    }

    // Play BIOS beep sound
    if (biosBeepRef.current) {
      biosBeepRef.current.play();
    }

    // BIOS stage
    const biosTimer = setTimeout(() => {
      setBootStage("logo");

      // Play disk access sound when transitioning to logo
      if (diskSoundRef.current) {
        diskSoundRef.current.play();
      }

      // Play Windows 98 startup sound when showing the logo
      setTimeout(() => {
        if (startupSoundRef.current) {
          startupSoundRef.current.play();
        }
      }, 1000);
    }, 3000);

    // Logo stage
    const logoTimer = setTimeout(() => {
      setBootStage("loading");
    }, 6000);

    // Loading progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);

    // Complete boot sequence
    const completeTimer = setTimeout(() => {
      sessionStorage.setItem("hasSeenBootSequence", "true");
      setShowOverlay(false);
      if (onComplete) onComplete();
    }, 12000);

    // Cleanup timers
    return () => {
      clearTimeout(biosTimer);
      clearTimeout(logoTimer);
      clearTimeout(completeTimer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  const skipBootSequence = () => {
    sessionStorage.setItem("hasSeenBootSequence", "true");
    setShowOverlay(false);
    if (onComplete) onComplete();
  };

  if (!showOverlay) return null;

  return (
    <div className="boot-sequence-overlay">
      {bootStage === "bios" && (
        <div className="bios-screen">
          <div className="bios-content">
            <p>NuSystems BIOS Version 4.51PG</p>
            <p>Copyright (C) 1998-2023</p>
            <p>CPU: 486DX 66MHz</p>
            <p>Memory Test: 16384K OK</p>
            <p className="bios-blinking">Press DEL to enter SETUP</p>
            <p>Detecting IDE drives...</p>
            <p>Primary Master: MAXTOR 84320D4</p>
            <p>Primary Slave: LITEON CD-ROM LTN382</p>
            <p>Secondary Master: None</p>
            <p>Secondary Slave: None</p>
            <p>Initializing Boot Sequence...</p>
          </div>
        </div>
      )}

      {bootStage === "logo" && (
        <div className="win98-logo-screen">
          <div className="win98-logo">
            <div className="win98-logo-flag"></div>
            <div className="win98-text">
              Windows<span>98</span>
            </div>
          </div>
        </div>
      )}

      {bootStage === "loading" && (
        <div className="win98-loading-screen">
          <p className="loading-text">Starting Windows 98...</p>
          <div className="progress-indicator">
            <span
              className="progress-indicator-bar"
              style={{ width: `${progress}%` }}
            ></span>
          </div>
        </div>
      )}

      <button className="skip-button" onClick={skipBootSequence}>
        Skip
      </button>

      {/* Audio elements */}
      <audio ref={startupSoundRef} src={startupSound} preload="auto"></audio>
      <audio ref={biosBeepRef} src={biosBeep} preload="auto"></audio>
      <audio ref={diskSoundRef} src={diskSound} preload="auto"></audio>
    </div>
  );
};

export default BootSequence;
