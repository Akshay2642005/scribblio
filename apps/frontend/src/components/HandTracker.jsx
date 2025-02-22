import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { loadModel, predictGesture } from "ai-model"; // Import AI model

const socket = io("http://localhost:5000");

const HandTracker = ({ roomId }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const startTracking = async () => {
      await loadModel(); // Load AI model

      const detectHands = async () => {
        if (!videoRef.current) return;
        const landmarks = await predictGesture(videoRef.current);
        if (landmarks) {
          socket.emit("hand_data", { roomId, landmarks });
        }
        requestAnimationFrame(detectHands);
      };

      detectHands();
    };

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });

    startTracking();
  }, []);

  return <video ref={videoRef} autoPlay style={{ display: "none" }} />;
};

export default HandTracker;
