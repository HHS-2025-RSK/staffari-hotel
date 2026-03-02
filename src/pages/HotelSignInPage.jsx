import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import firebaseAuthService from "../services/firebaseAuthService";
import notificationService from "../services/notificationService";
import { staffari } from "../theme/staffariTheme";
import { lsSet } from "../utils/storage";

export default function HotelSignInPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", color: "red" });

  const canSubmit = useMemo(() => {
    const e = email.trim();
    return e.length > 0 && e.includes("@") && password.length > 0 && !isLoading;
  }, [email, password, isLoading]);

  const showSnack = (msg, color = "red") => {
    setSnack({ open: true, msg, color });
    window.setTimeout(() => setSnack((s) => ({ ...s, open: false })), 2500);
  };

  const signIn = async (e) => {
    e.preventDefault();
    const e1 = email.trim();
    if (!e1 || !e1.includes("@"))
      return showSnack("Please enter a valid email", "red");
    if (!password) return showSnack("Please enter your password", "red");

    setIsLoading(true);
    const user = await firebaseAuthService.signInWithEmailAndPassword({
      email: e1,
      password,
    });

    if (!user) {
      setIsLoading(false);
      showSnack("Sign in failed. Check your credentials.", "red");
      return;
    }

    const role = await firebaseAuthService.getUserRole(user.uid);
    if (role !== "Hotel") {
      await firebaseAuthService.signOut();
      setIsLoading(false);
      showSnack("Only Hotel users can login here.", "red");
      return;
    }

    const userData = await firebaseAuthService.getUserData(user.uid, role);
    lsSet("isLoggedIn", true);
    Object.entries(userData).forEach(([k, v]) => lsSet(k, v));
    lsSet("uid", user.uid);
    lsSet("role", role);

    setIsLoading(false);
    navigate("/hotel", { replace: true });

    try {
      const settings = await notificationService.requestPermissionAfterLogin();
      lsSet("notifAuthorizationStatus", settings.authorizationStatus);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: staffari.earthyBeige,
      }}
    >
      {/* Import Bebas Neue font */}
      {/* Global Styles */}
      <style>
        {`
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@400;700;800&display=swap');

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px white inset !important;
  -webkit-text-fill-color: #000 !important;
  transition: background-color 5000s ease-in-out 0s;
}
`}
      </style>

      {/* LEFT SIDE: Image Section */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f3d34",
        }}
      >
        <img
          src="../../public/image.png"
          alt="Jungle Safari Theme"
          style={{
            width: "70%",
            height: "80%",
            objectFit: "contain",
          }}
        />
      </div>

      {/* RIGHT SIDE: Sign In Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <div style={{ maxWidth: 420, width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 64,
                color: "#0f3d34",
                margin: 0,
                lineHeight: 1,
              }}
            >
              Staffari
            </h1>
            <p
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: "#0f3d34",
                marginTop: 4,
                letterSpacing: "1px",
                // textTransform: "uppercase",
              }}
            >
              Hunt Smart. Hire Right.
            </p>
          </div>

          <div style={{ height: 40 }} />

          <form onSubmit={signIn}>
            <Field
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="Enter your email"
            />
            <div style={{ height: 20 }} />
            <Field
              label="Password"
              value={password}
              onChange={setPassword}
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Enter your password"
              right={
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((v) => !v)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: staffari.mutedOlive,
                    fontWeight: 700,
                  }}
                >
                  {isPasswordVisible ? "Hide" : "Show"}
                </button>
              }
            />

            <div style={{ height: 32 }} />

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: 12,
                border: "none",
                background: "#0f3d34", // Brand Color
                color: "#fff",
                cursor: canSubmit ? "pointer" : "not-allowed",
                opacity: canSubmit ? 1 : 0.6,
                fontSize: 18,
                fontWeight: 800,
                fontFamily: "Poppins, sans-serif",
                transition: "all 0.3s ease",
              }}
            >
              {isLoading ? "Signing In..." : "Login to Portal"}
            </button>
          </form>

          <div style={{ height: 24 }} />

          <div
            style={{ textAlign: "center", fontFamily: "Poppins, sans-serif" }}
          >
            <span style={{ color: staffari.charcoalBlack }}>
              Don't have an account?{" "}
            </span>
            <Link
              to="/signup"
              style={{
                color: "#0f3d34",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Snackbar remains the same */}
      {snack.open && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: 20,
            transform: "translateX(-50%)",
            background:
              snack.color === "red" ? "#E53935" : staffari.emeraldGreen,
            color: "#fff",
            padding: "12px 24px",
            borderRadius: 12,
            fontWeight: 800,
            zIndex: 9999,
          }}
        >
          {snack.msg}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type, placeholder, right }) {
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          marginBottom: 8,
          color: "#0f3d34",
          fontFamily: "Poppins",
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#fff",
          borderRadius: 12,
          border: `1px solid rgba(15, 61, 52, 0.2)`,
          padding: "14px",
        }}
      >
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={type}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 16,
          }}
        />
        {right && <div>{right}</div>}
      </div>
    </label>
  );
}
