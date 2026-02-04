import React, { useRef, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import ReactDOM from "react-dom";
import Webcam from "react-webcam";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import CryptoJS from "crypto-js";


import { FACE_DETECTION_URL,HEX_KEY_FACE_LOGIN } from '../../global/index'
import { API_URL } from '../../global/index'

const constant = {
  backendUrl: "https://iaudit.indiashelter.in:6448/verifyface",
  buttonText: "Start Face Verification",
  webcamIssue: "Webcam access denied or not available.",
  imageIssue: "Failed to capture image from webcam.",
  verficationError: "Verification failed. Please try again.",
};

interface FaceVerifyModalProps {
  onClose: () => void;
  referenceBase64: string | null;
  initialError?: string | null;
  token: string | null;
  verifyOTP: (otp: string, faceLogin: boolean) => void | Promise<void>;
  loimage: string;
  onCloseFaceDetection: () => void;
}

interface FaceVerifyWithBaseImageProps {
  verifyOTP: (otp: string, faceLogin: boolean) => void | Promise<void>;
  loImage: string;
}

const FaceVerifyModal: React.FC<FaceVerifyModalProps> = ({
  onClose,
  referenceBase64,
  initialError,
  token,
  verifyOTP,
  loimage,
  onCloseFaceDetection
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<Webcam>(null);

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [showWebcam, setShowWebcam] = useState<boolean>(true);
  const [faceOk, setFaceOk] = useState(false);
  const [faceMessage, setFaceMessage] = useState<string>("Position your face in the frame");

  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [captureProgress, setCaptureProgress] = useState<number>(0);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [mediaStarted, setMediaStarted] = useState(false);

  const startMedia = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setMediaStarted(true);
    } catch {
      alert(constant.webcamIssue);
    }
  };

  useEffect(() => {
    startMedia();
  }, []);

  const startCapturing = () => {
    if (!faceOk || !modelsLoaded) return;

    setIsCapturing(true);
    setCaptureProgress(0);

    const totalCaptures = 5;
    const intervalMs = 600;
    let count = 0;
    const tempImages: string[] = [];
    
    captureIntervalRef.current = setInterval(() => {
      const image = webcamRef.current?.getScreenshot();
      if (image) {
        tempImages.push(image);
        count++;
        setCaptureProgress((count / totalCaptures) * 100);

        if (count >= totalCaptures) {
          if (captureIntervalRef.current) {
            clearInterval(captureIntervalRef.current);
          }
          sendImagesToBackend(tempImages);
        }
      }
    }, intervalMs);
  };

  const resetCapture = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    setIsCapturing(false);
    setCaptureProgress(0);
  };

  const sendImagesToBackend = async (images: string[]) => {
    if (!loimage || images.length === 0) {
      setError("Reference image or captured images missing.");
      resetCapture();
      return;
    }

    setLoading(true);
    setShowWebcam(false);
    setError(null);

    try {


// encrypt the image screenshots ** 17-02
const key = CryptoJS.enc.Hex.parse(
  HEX_KEY_FACE_LOGIN
);

const iv = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");

 const encrypt = (base64Str: string) => {
  const encrypted = CryptoJS.AES.encrypt(base64Str, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
};

const encryptedImages = images.map(img => encrypt(img));


      const res = await axios.post(
        `${API_URL}${FACE_DETECTION_URL}`,
        {
          reference_image_base64: loimage,
          live_image_base64_list: encryptedImages,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );


//       const res = {data:{
//     "data": {
//         "liveness": {
//             "label": "live",
//             "confidence": 1
//         },
//         "face_match": {
//             "matched": "Yes",
//             "similarity": 90.3
//         }
//     },
//     "status": true
// }}

            console.log("BASE",res?.data?.data)


      if (res?.data?.error) {
        setResult({ error: res.data.error });
      } else {
        console.log("FACE LOGIN RESPONSE", res?.data.data);
        if ((res?.data.data?.["face_match"]?.["matched"] == "Yes") && (res?.data.data?.["liveness"]?.["label"] == "live")) {
          await verifyOTP("0", true);
        } else {
          setResult({ error: "User Authentication unsuccessful. Contact IT admin for support." });
        }
      }
    } catch (err) {
      console.error(err);
      setError("Server error occurred.");
    } finally {
      setLoading(false);
      resetCapture();
    }
  };

  useEffect(() => {
    const loadModels = async () => {
      if (!mediaStarted) return;
      await faceapi.nets.tinyFaceDetector.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models/');
      await faceapi.nets.faceLandmark68Net.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models/');
      setModelsLoaded(true);
    };
    loadModels();
  }, [mediaStarted]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (webcamRef.current && webcamRef.current.video && modelsLoaded) {
        const video = webcamRef.current.video;
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5,
          }))
          .withFaceLandmarks();

        if (detections.length === 0) {
          setFaceOk(false);
          setFaceMessage("No face detected");
          if (isCapturing) {
            resetCapture();
          }
        } else if (detections.length > 1) {
          setFaceOk(false);
          setFaceMessage("Multiple faces detected. Only one person allowed");
          if (isCapturing) {
            resetCapture();
          }
        } else {
          const detection = detections[0];
          const box = detection.detection.box;
          const landmarks = detection.landmarks;
          
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;

          // Check 1: Face size (distance check)
          const faceArea = box.width * box.height;
          const frameArea = videoWidth * videoHeight;
          const faceRatio = faceArea / frameArea;
          const isGoodSize = faceRatio > 0.15 && faceRatio < 0.5;

          // Get facial landmarks
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();
          const nose = landmarks.getNose();
          
          // Calculate eye positions
          const leftEyeCenter = {
            x: leftEye.reduce((sum, p) => sum + p.x, 0) / leftEye.length,
            y: leftEye.reduce((sum, p) => sum + p.y, 0) / leftEye.length,
          };
          const rightEyeCenter = {
            x: rightEye.reduce((sum, p) => sum + p.x, 0) / rightEye.length,
            y: rightEye.reduce((sum, p) => sum + p.y, 0) / rightEye.length,
          };

          const noseTip = nose[3];
          const eyeDistance = Math.abs(leftEyeCenter.x - rightEyeCenter.x);
          
          // Check 2: Head tilt (left/right tilt)
          const eyeLevelDiff = Math.abs(leftEyeCenter.y - rightEyeCenter.y);
          const tiltRatio = eyeLevelDiff / eyeDistance;
          const isLevelHead = tiltRatio < 0.15;

          // Check 3: Face orientation (left/right turn)
          const faceMidX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
          const noseOffsetX = Math.abs(noseTip.x - faceMidX);
          const horizontalOffset = noseOffsetX / eyeDistance;
          const isFacingForward = horizontalOffset < 0.25;

          // Check 4: Up/Down head angle - RELAXED
          const eyeMidY = (leftEyeCenter.y + rightEyeCenter.y) / 2;
          const noseToEyeDistance = noseTip.y - eyeMidY;
          const expectedDistance = eyeDistance * 0.8;
          // const verticalRatio = Math.abs(noseToEyeDistance / expectedDistance);
          const verticalRatio = noseToEyeDistance / expectedDistance;
          // const isHeadStraightVertical = verticalRatio > 0.6 && verticalRatio < 1.5; // More relaxed range
          const isHeadStraightVertical = verticalRatio > 0.6 && verticalRatio < 1.5; // More relaxed range

          // Check 5: Face centering
          const faceCenterX = box.x + box.width / 2;
          const faceCenterY = box.y + box.height / 2;
          const frameCenterX = videoWidth / 2;
          const frameCenterY = videoHeight / 2;
          
          const xOffset = Math.abs(faceCenterX - frameCenterX) / videoWidth;
          const yOffset = Math.abs(faceCenterY - frameCenterY) / videoHeight;
          const isCentered = xOffset < 0.2 && yOffset < 0.2;

          // Determine status with priority
          let message = "";
          let isOk = false;

          if (!isGoodSize) {
            if (faceRatio < 0.15) {
              // message = "Come closer";
              message = "Move closer to the camera";
            } else {
              message = "Move back a bit";
            }
          } else if (!isCentered) {
            message = "Center your face in the frame";
          } else if (!isHeadStraightVertical) {
            if (verticalRatio < 0.6) {
              message = "Look straight, don't look up too much";
            } else {
              message = "Look straight, don't look down too much";
            }
          } else if (!isFacingForward) {
            message = "Face the camera directly";
          } else if (!isLevelHead) {
            message = "Keep your head straight (don't tilt)";
          } else {
            // message = "Perfect! Ready to verify";
            isOk = true;
          }

          setFaceOk(isOk);
          setFaceMessage(message);

          if (isCapturing && !isOk) {
            resetCapture();
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isCapturing, modelsLoaded]);

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div style={styles.overlay} onClick={onCloseFaceDetection}>
      <div ref={modalRef} style={styles.modal} onClick={handleModalClick}>
        {!isCapturing && (
          <h3 style={{
            ...styles.heading,
            color: faceOk ? "#28a745" : "#dc3545"
          }}>
            {faceMessage}
          </h3>
        )}

        {loading && <p style={styles.loading}>Processing...please wait.</p>}
        {!loading && error && <p style={styles.error}>{error}</p>}

        {!loading && !error && !result && (
          <>
            {showWebcam && (
              <div style={styles.webcamWrapper}>
                <div
                  style={{
                    position: "relative",
                    border: `4px solid ${faceOk ? "#28a745" : "#dc3545"}`,
                    borderRadius: "50%",
                    width: "210px",
                    height: "300px",
                    overflow: "hidden",
                    margin: "1rem auto",
                    transition: "border-color 0.3s ease",
                  }}
                >
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onUserMediaError={() => setError("Webcam issue")}
                    videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
                    mirrored
                  />

                  {isCapturing && (
                    <svg
                      style={{ 
                        position: "absolute", 
                        top: 0, 
                        left: 0, 
                        width: "100%", 
                        height: "100%", 
                        transform: "rotate(-90deg)" 
                      }}
                    >
                      <circle cx="105" cy="150" r="100" stroke="rgba(40, 167, 69, 0.3)" strokeWidth="8" fill="none" />
                      <circle
                        cx="105"
                        cy="150"
                        r="100"
                        stroke="#28a745"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 100}`}
                        strokeDashoffset={`${2 * Math.PI * 100 * (1 - captureProgress / 100)}`}
                        style={{ transition: "stroke-dashoffset 0.3s ease" }}
                      />
                    </svg>
                  )}
                </div>
              </div>
            )}

            {!isCapturing && faceOk && (
              <button onClick={startCapturing} disabled={loading} style={styles.button}>
                Verify
              </button>
            )}

            {isCapturing && (
              <h3 style={{ color: "#0077cc", marginTop: "1rem" }}>
                Capturing ... {Math.round(captureProgress)}%
              </h3>
            )}
          </>
        )}

        {!loading && result && (
          <div style={styles.result}>
            {result.error ? (
              <p style={styles.error}>{result.error}</p>
            ) : (
              <div style={styles.resultGrid}>
                <div>
                  <strong>Server Busy, Please Try Again</strong>
                </div>
              </div>
            )}
          </div>
        )}
		{!isCapturing && faceOk && (
        <button onClick={onCloseFaceDetection} style={{ ...styles.button, marginTop: "1rem" }}>
          Close
        </button>
		)}
      </div>
    </div>
  );
};

const FaceVerifyWithBaseImage: React.FC<FaceVerifyWithBaseImageProps> = ({
  verifyOTP,
  loImage,
}) => {
  const [referenceBase64, setReferenceBase64] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(true);
  const [modalError, setModalError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setModalError(null);
      setShowModal(true);
    } catch {
      setModalError(constant.webcamIssue);
      setShowModal(true);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Image size should be less than ${maxSizeMB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setReferenceBase64(result);
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Liveness Suite</h2>
        <nav style={styles.nav}>
          <button
            style={styles.navButton}
            onClick={handleClick}
          >
            Liveness Detection
          </button>
        </nav>
      </aside>

      <main style={styles.main}>
        <h1 style={styles.header}>Upload Reference Image (POC)</h1>
        <p style={styles.subtitle}>
          Select a clear photo of the user to compare against live webcam input for identity verification.
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={styles.inputFile}
        />
        {preview && <img src={preview} alt="Preview" style={styles.previewImage} />}
        {referenceBase64 && (
          <button onClick={handleClick} style={styles.button}>
            {constant.buttonText}
          </button>
        )}

        {showModal && (
          <FaceVerifyModal
            referenceBase64={referenceBase64}
            initialError={modalError}
            token={localStorage.getItem("apiKey")}
            onClose={() => setShowModal(false)}
            verifyOTP={verifyOTP}
            loimage={loImage}
            onCloseFaceDetection={() => setShowModal(false)}
          />
        )}
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
    background: "linear-gradient(to right, #e3f2fd, #fce4ec)",
  },
  sidebar: {
    width: "240px",
    backgroundColor: "#0077cc",
    color: "#fff",
    padding: "2rem 1rem",
    boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
  },
  sidebarTitle: {
    fontSize: "1.5rem",
    marginBottom: "2rem",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  navButton: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "1rem",
    textAlign: "left",
    cursor: "pointer",
    padding: "0.5rem 0",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
  },
  main: {
    flex: 1,
    padding: "3rem",
  },
  header: {
    fontSize: "2rem",
    marginBottom: "0.5rem",
    color: "#333",
  },
  subtitle: {
    fontSize: "1rem",
    marginBottom: "1.5rem",
    color: "#555",
  },
  inputFile: {
    marginBottom: "1rem",
    padding: "0.5rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    width: "100%",
    maxWidth: "300px",
  },
  previewImage: {
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    objectFit: "cover",
    margin: "1rem auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    display: "block",
  },
  button: {
    margin: "1rem",
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#0077cc",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  modal: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "500px",
    textAlign: "center",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
  heading: {
    margin: "0.5rem 0",
    fontWeight: "600",
    fontSize: "1.1rem",
  },
  error: {
    color: "#d9534f",
    marginBottom: "1rem",
    fontWeight: "500",
  },
  result: {
    marginTop: "1rem",
    textAlign: "left",
    backgroundColor: "#f9f9f9",
    padding: "1rem",
    borderRadius: "8px",
    fontSize: "0.95rem",
    color: "#333",
  },
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "0.5rem",
  },
};

export default FaceVerifyModal;