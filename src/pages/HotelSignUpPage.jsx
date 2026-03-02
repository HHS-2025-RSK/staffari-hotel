// src/pages/HotelSignUpPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import firebaseAuthService from "../services/firebaseAuthService";
import { staffari } from "../theme/staffariTheme";
import { lsSet } from "../utils/storage";

const TERMS_URL = "https://www.jacmagnus.com";
const CONTACT_URL = "https://www.jacmagnus.com";

// Premium SVG Icons
const Icons = {
  Hotel: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18M3 7v14m18-14v14M3 7l9-4 9 4M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4M7 11h2m4 0h2M7 15h2m4 0h2" />
    </svg>
  ),
  Mail: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Phone: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Lock: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
};

export default function HotelSignUpPage() {
  const navigate = useNavigate();

  const [hotelName, setHotelName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", color: "red" });

  const showSnack = (msg, color = "red") => {
    setSnack({ open: true, msg, color });
    window.setTimeout(() => setSnack((s) => ({ ...s, open: false })), 2500);
  };

  const openLink = (url) => {
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      showSnack("Could not open link", "red");
    }
  };

  const canSubmit = useMemo(() => {
    if (isLoading) return false;
    if (!hotelName.trim()) return false;
    if (!email.trim() || !email.includes("@")) return false;
    if ((phone || "").replace(/\D/g, "").length < 10) return false;
    if (!password || password.length < 8) return false;
    if (confirmPassword !== password) return false;
    return true;
  }, [hotelName, email, phone, password, confirmPassword, isLoading]);

  const validate = () => {
    if (!hotelName.trim()) return "Please enter the hotel name";
    if (!email.trim() || !email.includes("@"))
      return "Please enter a valid email";
    if ((phone || "").replace(/\D/g, "").length < 10)
      return "Please enter a valid phone number";
    if (!password || password.length < 8)
      return "Password must be at least 8 characters";
    if (confirmPassword !== password) return "Passwords do not match";
    if (!termsAccepted) return "Please accept Terms & Conditions to continue.";
    return null;
  };

  const signUp = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      showSnack(err, err.includes("Terms") ? "orange" : "red");
      return;
    }

    setIsLoading(true);
    const user = await firebaseAuthService.signUpWithEmailAndPassword({
      email: email.trim(),
      password,
      fullName: hotelName.trim(),
      phone: phone.trim(),
      role: "Hotel",
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    });

    setIsLoading(false);
    if (!user) {
      showSnack("Registration failed. Email might be in use.", "red");
      return;
    }

    const userData = await firebaseAuthService.getUserData(user.uid, "Hotel");
    if (!userData) {
      showSnack("Registered, but could not fetch profile.", "red");
      return;
    }

    lsSet("isLoggedIn", true);
    Object.entries(userData).forEach(([k, v]) => lsSet(k, v));
    lsSet("uid", user.uid);
    lsSet("role", "Hotel");

    navigate("/hotel", { replace: true });
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: staffari.earthyBeige,
      }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@400;600;700;800&display=swap');`}
      </style>

      {/* LEFT SIDE: Brand Image Section */}
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
          src="/image.png"
          alt="Luxury Hospitality"
          style={{
            width: "70%",
            height: "80%",
            objectFit: "contain",
          }}
        />
      </div>

      {/* RIGHT SIDE: Signup Form */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "40px",
          overflowY: "auto", // ✅ only this scrolls
        }}
      >
        <div
          style={{
            maxWidth: 440,
            width: "100%",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 52,
                color: "#0f3d34",
                margin: 0,
              }}
            >
              STAFFARI
            </h1>
            <p
              style={{
                fontFamily: "Poppins",
                fontSize: 15,
                fontWeight: 700,
                color: "#7b6f57",
                marginTop: 4,
              }}
            >
              List Your Property
            </p>
          </div>

          <div style={{ height: 32 }} />

          <form
            onSubmit={signUp}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <Field
              Icon={Icons.Hotel}
              label="Hotel Name"
              value={hotelName}
              onChange={setHotelName}
              placeholder="Grand Palace Resort"
            />
            <Field
              Icon={Icons.Mail}
              label="Professional Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="hr@hotel.com"
            />
            <Field
              Icon={Icons.Phone}
              label="Contact Number"
              type="tel"
              value={phone}
              onChange={setPhone}
              placeholder="+91 98765 43210"
            />
            <Field
              Icon={Icons.Lock}
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="..."
            />
            <Field
              Icon={Icons.Lock}
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="..."
            />

            <div style={{ height: 4 }} />

            {/* Terms Agreement */}
            <label
              style={{
                display: "flex",
                gap: "12px",
                cursor: "pointer",
                padding: "12px",
                background: "rgba(123,111,87,0.05)",
                borderRadius: "12px",
              }}
            >
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: "#0f3d34",
                  cursor: "pointer",
                }}
              />
              <span
                style={{
                  fontSize: "13px",
                  color: "#0f3d34",
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                I agree to the{" "}
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    openLink(TERMS_URL);
                  }}
                  style={{ fontWeight: 800, textDecoration: "underline" }}
                >
                  Terms & Conditions
                </span>
                . Required for property registration.
              </span>
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "14px",
                border: "none",
                background: "#0f3d34",
                color: "#fff",
                cursor: canSubmit ? "pointer" : "not-allowed",
                opacity: canSubmit ? 1 : 0.6,
                fontSize: 18,
                fontWeight: 800,
                fontFamily: "Poppins",
                marginTop: "12px",
                transition: "all 0.3s ease",
              }}
            >
              {isLoading ? "Creating Account..." : "Register Property"}
            </button>
          </form>

          <div style={{ height: 24 }} />

          <div
            style={{
              textAlign: "center",
              fontFamily: "Poppins",
              fontSize: "14px",
            }}
          >
            <span style={{ color: "#7b6f57" }}>Already listing with us? </span>
            <Link
              to="/signin"
              style={{
                color: "#0f3d34",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Login here
            </Link>
          </div>
        </div>
      </div>

      {/* Snackbar with glass effect */}
      {snack.open && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: 30,
            transform: "translateX(-50%)",
            background:
              snack.color === "red"
                ? "rgba(229, 57, 53, 0.9)"
                : snack.color === "orange"
                  ? "rgba(251, 140, 0, 0.9)"
                  : "rgba(15, 61, 52, 0.9)",
            color: "#fff",
            padding: "14px 28px",
            borderRadius: "14px",
            fontWeight: 700,
            zIndex: 9999,
            backdropFilter: "blur(10px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            fontFamily: "Poppins",
          }}
        >
          {snack.msg}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, Icon }) {
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          marginBottom: 6,
          color: "#0f3d34",
          fontFamily: "Poppins",
          fontWeight: 700,
          fontSize: "13px",
          opacity: 0.8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "#fff",
          borderRadius: "14px",
          border: `1.5px solid rgba(15, 61, 52, 0.1)`,
          padding: "12px 16px",
          transition: "border-color 0.2s",
        }}
      >
        <div style={{ color: "#0f3d34", opacity: 0.6 }}>
          <Icon />
        </div>
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
            fontSize: "15px",
            fontFamily: "Poppins",
            fontWeight: 500,
            color: "#0f3d34",
          }}
        />
      </div>
    </label>
  );
}
