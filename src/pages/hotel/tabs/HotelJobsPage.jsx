import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchHotelJobs } from "../../../api/jobCrudApi";
import JobCard from "../shared/JobCard";
import JobDetailsSheet from "../shared/JobDetailsSheet";
import { JobPostMode } from "../jobs/jobPostMode";

// --- PREMIUM ICONS ---
const Icons = {
  Refresh: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 4v6h-6" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  Plus: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Zap: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Matching: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Empty: () => (
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.3"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
};

export default function HotelJobsPage() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await fetchHotelJobs();
      setJobs(list);
    } catch (e) {
      setError(e);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDetails = (job) => {
    setSelectedJob(job);
    setDetailsOpen(true);
  };

  const openMatchingProfiles = (job) => {
    const jobId = (job?.id ?? job?.job_id ?? job?.jobId ?? "").toString();
    if (!jobId.trim()) return alert("Job ID missing");

    navigate(`/hotel/jobs/${encodeURIComponent(jobId)}/matching`, {
      state: {
        jobId,
        jobTitle: (job?.title ?? job?.job_title ?? "").toString() || null,
      },
    });
  };

  const goToPostForm = (mode) => {
    navigate("/hotel/jobs/post", { state: { mode } });
  };

  return (
    <div style={{ minHeight: "100%", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@400;600;800;900&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
      `}</style>

      {/* HEADER SECTION */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "Bebas Neue",
              fontSize: "42px",
              color: "#0f3d34",
              margin: 0,
              letterSpacing: "1px",
            }}
          >
            Your Job Postings
          </h1>
          <p
            style={{
              margin: 0,
              color: "#7b6f57",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Monitor and manage your active talent hunts.
          </p>
        </div>

        <button onClick={load} style={refreshBtnStyle}>
          <Icons.Refresh />
          {/* <span>Sync</span> */}
        </button>
      </div>

      {/* JOBS LIST */}
      <div style={{ paddingBottom: 100 }}>
        {isLoading ? (
          <ShimmerList />
        ) : error ? (
          <ErrorWidget error={error} onRetry={load} />
        ) : jobs.length === 0 ? (
          <EmptyState onPost={() => goToPostForm(JobPostMode.full)} />
        ) : (
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}
          >
            {jobs.map((job, idx) => (
              <div key={String(job?.id || idx)} style={jobCardWrapperStyle}>
                <JobCard
                  job={job}
                  onTap={() => openDetails(job)}
                  showLikeButton={false}
                />
                <div style={cardActionAreaStyle}>
                  <button
                    onClick={() => openMatchingProfiles(job)}
                    style={matchingBtnStyle}
                  >
                    <Icons.Matching />
                    See matching profiles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAILS SHEET */}
      <JobDetailsSheet
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        job={selectedJob ? { ...selectedJob, hideApplyButton: true } : null}
        onSaved={() => load()}
      />

      {/* PREMIUM FLOATING ACTION BUTTONS */}
      <div style={fabContainerStyle}>
        <FabExtended
          bg="#fff"
          color="#0f3d34"
          icon={<Icons.Zap />}
          label="Quick Post"
          onClick={() => goToPostForm(JobPostMode.quick)}
          border="1.5px solid #0f3d34"
        />
        <FabExtended
          bg="#0f3d34"
          color="#fff"
          icon={<Icons.Plus />}
          label="Post New Vacancy"
          onClick={() => goToPostForm(JobPostMode.full)}
        />
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function FabExtended({ bg, color, label, icon, onClick, border = "none" }) {
  return (
    <button
      onClick={onClick}
      style={{
        border,
        background: bg,
        color: color,
        borderRadius: "16px",
        padding: "14px 24px",
        cursor: "pointer",
        fontFamily: "Poppins",
        fontWeight: 800,
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        boxShadow: "0 12px 24px rgba(15, 61, 52, 0.15)",
        transition: "transform 0.2s",
      }}
      onMouseOver={(e) =>
        (e.currentTarget.style.transform = "translateY(-4px)")
      }
      onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {icon}
      {label}
    </button>
  );
}

function EmptyState({ onPost }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "80px 20px",
        background: "#fff",
        borderRadius: "24px",
      }}
    >
      <div
        style={{
          color: "#7b6f57",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Icons.Empty />
      </div>
      <h2
        style={{
          fontFamily: "Bebas Neue",
          fontSize: "32px",
          color: "#0f3d34",
          margin: 0,
        }}
      >
        No Listings Yet
      </h2>
      <p style={{ color: "#7b6f57", fontSize: "14px", marginBottom: "24px" }}>
        You haven't posted any job opportunities yet.
      </p>
      <button onClick={onPost} style={primaryBtnStyle}>
        Create First Posting
      </button>
    </div>
  );
}

function ErrorWidget({ error, onRetry }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 20px",
        background: "#fff",
        borderRadius: "24px",
      }}
    >
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
      <h3
        style={{
          fontSize: "18px",
          fontWeight: 800,
          color: "#0f3d34",
          margin: "0 0 8px",
        }}
      >
        Load Failed
      </h3>
      <p style={{ color: "#7b6f57", fontSize: "14px", margin: "0 0 24px" }}>
        {error?.message || "Check your internet."}
      </p>
      <button onClick={onRetry} style={primaryBtnStyle}>
        Retry Sync
      </button>
    </div>
  );
}

function ShimmerList() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: "180px",
            borderRadius: "24px",
            background: "#fff",
            animation: "pulse 1.5s infinite",
          }}
        />
      ))}
    </div>
  );
}

// --- STYLES ---

const refreshBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: "#fff",
  border: "1.5px solid rgba(15, 61, 52, 0.1)",
  padding: "10px 20px",
  borderRadius: "12px",
  cursor: "pointer",
  color: "#0f3d34",
  fontWeight: 700,
  fontSize: "14px",
};

const jobCardWrapperStyle = {
  background: "#fff",
  borderRadius: "24px",
  overflow: "hidden",
  border: "1px solid rgba(15, 61, 52, 0.06)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
};

const cardActionAreaStyle = {
  padding: "0 24px 24px",
  background: "#fff",
};

const matchingBtnStyle = {
  width: "100%",
  height: "48px",
  borderRadius: "14px",
  border: "none",
  background: "#f0f2f1",
  color: "#0f3d34",
  cursor: "pointer",
  fontFamily: "Poppins",
  fontWeight: 700,
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  transition: "all 0.2s",
};

const fabContainerStyle = {
  position: "fixed",
  right: "40px",
  bottom: "40px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  zIndex: 100,
};

const primaryBtnStyle = {
  background: "#0f3d34",
  color: "#fff",
  border: "none",
  padding: "14px 28px",
  borderRadius: "14px",
  fontWeight: 800,
  cursor: "pointer",
};
