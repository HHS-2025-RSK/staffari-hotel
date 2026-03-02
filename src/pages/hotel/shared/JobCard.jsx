import React from "react";

// Premium SVG Icons
const Icons = {
  Location: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Heart: (filled) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? "#ef4444" : "none"}
      stroke={filled ? "#ef4444" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
};

export default function JobCard({
  job,
  onTap,
  showLikeButton = false,
  isLiked = false,
  onLikeTap,
}) {
  return (
    <div
      onClick={onTap}
      role="button"
      tabIndex={0}
      style={{
        background: "#fff",
        borderRadius: "20px",
        border: "1px solid rgba(15, 61, 52, 0.08)",
        padding: "20px",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(15, 61, 52, 0.06)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@400;600;700&display=swap');`}
      </style>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Job Title */}
          <div
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "24px",
              letterSpacing: "0.5px",
              color: "#0f3d34",
              lineHeight: "1.1",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {job?.title ?? job?.job_title ?? "Untitled Role"}
          </div>

          {/* Company Name */}
          <div
            style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              color: "#7b6f57",
              marginTop: "4px",
            }}
          >
            {job?.company ?? "Hotel Member"}
          </div>
        </div>

        {/* Optional Like Button */}
        {showLikeButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLikeTap && onLikeTap(job);
            }}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: isLiked ? "#ef4444" : "#7b6f57",
              transition: "transform 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.1)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {Icons.Heart(isLiked)}
          </button>
        )}
      </div>

      {/* Location Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginTop: "12px",
          color: "#7b6f57",
          fontSize: "12px",
          fontWeight: 500,
        }}
      >
        <Icons.Location />
        <span>{job?.location || "India"}</span>
        <span style={{ opacity: 0.3 }}>•</span>
        <span>{job?.department || "General"}</span>
      </div>
    </div>
  );
}
