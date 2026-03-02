import React from "react";
import { staffari } from "../../../theme/staffariTheme";
import JobDetailsPage from "./JobDetailsPage";

export default function JobDetailsSheet({ open, onClose, job, onSaved }) {
  if (!open) return null;

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 61, 52, 0.4)", // Brand-tinted overlay
        backdropFilter: "blur(8px)", // Premium glass effect
        zIndex: 9999,
        display: "grid",
        placeItems: "center", // Centered for a more professional desktop feel
        padding: "24px",
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "min(1000px, 100%)", // Slightly wider for a dashboard feel
          maxHeight: "95vh",
          background: staffari.cardBackground,
          borderRadius: 32, // More rounded for luxury feel
          overflow: "hidden",
          boxShadow: "0 32px 64px -12px rgba(0, 0, 0, 0.3)",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <JobDetailsPage job={job} onClose={onClose} onSaved={onSaved} />
      </div>
    </div>
  );
}
