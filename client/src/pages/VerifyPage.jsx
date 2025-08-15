import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"; // ✅ Added import
import styles from "../styles/VerifyPage.module.css";

export default function VerifyPage() {
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3003/api/auth/verify?token=${token}`
        );

        // ✅ Adjust to match backend response
        if (response.status === 200) {
            const { token, name } = response.data;
            if (token) {
              localStorage.setItem("cv_token", token);
              localStorage.setItem("cv_user", name || "");
            }
            setStatus("success");
            setTimeout(() => navigate("/dashboard"), 3000);
          }
          else {
          setStatus("error");
        }
      } catch (err) {
        setStatus("error");
      }
    };

    verifyToken();
  }, [location.search, navigate]);

  return (
    <div className={styles.container}>
      <div
        className={`${styles.card} ${styles.fadeIn}`}
        role="alert"
        aria-live="polite"
      >
        {status === "loading" && (
          <>
            <div className={styles.spinner} aria-label="Verifying account"></div>
            <p className={styles.message}>Verifying your account...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className={styles.iconSuccess} aria-hidden="true">✔</div>
            <p className={styles.messageSuccess}>
              Your account is verified! Redirecting…
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className={styles.iconError} aria-hidden="true">⚠</div>
            <p className={styles.messageError}>
              Invalid or expired verification link.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
