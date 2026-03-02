import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { staffari } from "../../../theme/staffariTheme";
import { lsGet } from "../../../utils/storage";
import {
  bulkUpdateApplicationStatus,
  fetchJobApplicants,
  updateApplicationStatus,
} from "../../../api/hotelApplicantsApi";
import { createConversation } from "../../../api/chatApi";

// --- PREMIUM ICONS ---
const Icons = {
  Back: () => (
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
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Chat: () => (
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Email: () => (
    <svg
      width="16"
      height="16"
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
      width="16"
      height="16"
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
  Calendar: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Selection: () => (
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
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  User: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

const STATUS_MENU = ["Interview Scheduled", "Accepted", "Rejected", "Pending"];

function statusInfo(statusRaw) {
  const s = String(statusRaw || "pending").toLowerCase();
  if (s.includes("accepted") || s.includes("hired"))
    return { text: "Accepted", color: "#10b981", bg: "#f0fdf4" };
  if (s.includes("interview"))
    return { text: "Interview", color: "#3b82f6", bg: "#eff6ff" };
  if (s.includes("rejected"))
    return { text: "Rejected", color: "#ef4444", bg: "#fef2f2" };
  return { text: "Pending", color: "#f59e0b", bg: "#fffbeb" };
}

function shouldShowChatButton(statusRaw) {
  const s = String(statusRaw || "").toLowerCase();
  return (
    s.includes("interview") ||
    s.includes("accepted") ||
    s.includes("pending") ||
    s.includes("hired")
  );
}

export default function ViewApplicationsPage() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const location = useLocation();
  const hotelOwnerId = lsGet("uid", null);

  const selectedJobData = location.state?.selectedJobData || null;
  const jobData = selectedJobData?.jobData || {};
  const title = jobData?.title || "Job Posting";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [updatingStatusFor, setUpdatingStatusFor] = useState(() => new Set());
  const [isCreatingChatFor, setIsCreatingChatFor] = useState(() => new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedApplicantIds, setSelectedApplicantIds] = useState(
    () => new Set(),
  );
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const allSelected = useMemo(
    () =>
      applicants.length > 0 && selectedApplicantIds.size === applicants.length,
    [applicants.length, selectedApplicantIds],
  );

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!hotelOwnerId) throw new Error("Hotel owner not logged in.");
      const list = await fetchJobApplicants({ hotelOwnerId, jobId });
      setApplicants(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [jobId]);

  const toggleSelectionMode = () => {
    if (isBulkUpdating) return;
    setIsSelectionMode((v) => !v);
    setSelectedApplicantIds(new Set());
  };

  const toggleSelectAll = () => {
    if (isBulkUpdating) return;
    setSelectedApplicantIds(() => {
      if (allSelected) return new Set();
      const next = new Set();
      applicants.forEach((a) => {
        const id = String(a?.userid ?? a?.user_id ?? "");
        if (id) next.add(id);
      });
      return next;
    });
  };

  const toggleSelected = (applicantUserId) => {
    if (isBulkUpdating) return;
    setSelectedApplicantIds((prev) => {
      const next = new Set(prev);
      if (next.has(applicantUserId)) next.delete(applicantUserId);
      else next.add(applicantUserId);
      return next;
    });
  };

  const doUpdateStatus = async (applicantUserId, newStatus) => {
    setUpdatingStatusFor((prev) => new Set(prev).add(applicantUserId));
    try {
      await updateApplicationStatus({
        hotelOwnerId,
        jobId,
        userId: applicantUserId,
        status: newStatus,
      });
      setApplicants((prev) =>
        prev.map((a) => {
          const id = String(a?.userid ?? a?.user_id ?? "");
          return id === applicantUserId ? { ...a, status: newStatus } : a;
        }),
      );
    } catch (e) {
      alert(String(e?.message || e));
    } finally {
      setUpdatingStatusFor((prev) => {
        const next = new Set(prev);
        next.delete(applicantUserId);
        return next;
      });
    }
  };

  const doBulkUpdate = async (newStatus) => {
    if (selectedApplicantIds.size === 0)
      return alert("Select at least one applicant.");
    setIsBulkUpdating(true);
    try {
      await bulkUpdateApplicationStatus({
        hotelOwnerId,
        jobId,
        updates: Array.from(selectedApplicantIds).map((id) => ({
          userid: id,
          status: newStatus,
        })),
      });
      setApplicants((prev) =>
        prev.map((a) => {
          const id = String(a?.userid ?? a?.user_id ?? "");
          return selectedApplicantIds.has(id) ? { ...a, status: newStatus } : a;
        }),
      );
      setSelectedApplicantIds(new Set());
      setIsSelectionMode(false);
    } catch (e) {
      alert(String(e?.message || e));
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const openChatForApplicant = async (applicant) => {
    if (isSelectionMode) return;
    const jobSeekerId = String(applicant?.userid ?? applicant?.user_id ?? "");
    if (!jobSeekerId) return;
    setIsCreatingChatFor((prev) => new Set(prev).add(jobSeekerId));
    try {
      const conversationId = await createConversation({
        hotelOwnerId,
        jobSeekerId,
      });
      navigate("/hotel/chats", {
        state: {
          conversationId,
          hotelOwnerId,
          jobSeekerId,
          jobTitle: title,
          company: jobData?.company || "Company",
        },
      });
    } catch (e) {
      alert(String(e?.message || e));
    } finally {
      const jobSeekerId = String(applicant?.userid ?? applicant?.user_id ?? "");
      setIsCreatingChatFor((prev) => {
        const next = new Set(prev);
        next.delete(jobSeekerId);
        return next;
      });
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: staffari.earthyBeige,
        paddingBottom: "40px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@400;600;800&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
      `}</style>

      {/* Premium Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#fff",
          borderBottom: "1px solid rgba(15, 61, 52, 0.08)",
          padding: "16px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button onClick={() => navigate("/hotel")} style={headerBtnStyle}>
            <Icons.Back />
          </button>
          <div>
            <h1
              style={{
                fontFamily: "Bebas Neue",
                fontSize: "32px",
                color: "#0f3d34",
                margin: 0,
                lineHeight: 1,
              }}
            >
              Applicants
            </h1>
            <p
              style={{
                margin: 0,
                color: "#7b6f57",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {title}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={toggleSelectionMode}
            style={{
              ...actionBtnStyle,
              background: isSelectionMode ? "#0f3d34" : "#fff",
              color: isSelectionMode ? "#fff" : "#0f3d34",
            }}
          >
            <Icons.Selection /> {isSelectionMode ? "Cancel" : "Bulk Action"}
          </button>
          {isSelectionMode && (
            <>
              <button onClick={toggleSelectAll} style={actionBtnStyle}>
                {allSelected ? "Deselect All" : "Select All"}
              </button>
              <select
                disabled={isBulkUpdating}
                defaultValue=""
                onChange={(e) => {
                  doBulkUpdate(e.target.value);
                  e.target.value = "";
                }}
                style={selectStyle}
              >
                <option value="" disabled>
                  Change Status...
                </option>
                {STATUS_MENU.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      <div
        style={{ maxWidth: "900px", margin: "32px auto", padding: "0 20px" }}
      >
        {isLoading ? (
          <ShimmerApplicants />
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              background: "#fff",
              borderRadius: "20px",
            }}
          >
            <p style={{ color: "#ef4444", fontWeight: 700 }}>
              {String(error?.message || error)}
            </p>
            <button onClick={load} style={primaryBtnStyle}>
              Retry
            </button>
          </div>
        ) : applicants.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              background: "#fff",
              borderRadius: "20px",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🕵️</div>
            <h2
              style={{
                fontFamily: "Bebas Neue",
                fontSize: "28px",
                color: "#0f3d34",
              }}
            >
              No applications yet
            </h2>
            <p style={{ color: "#7b6f57" }}>
              Candidates will appear here once they apply to this posting.
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {applicants.map((a, idx) => {
              const profile = a?.profile_snapshot || a?.profileSnapshot || {};
              const info = statusInfo(a?.status);
              const userId = String(a?.userid ?? a?.user_id ?? "");
              const isSelected = selectedApplicantIds.has(userId);
              const isUpdating = updatingStatusFor.has(userId);
              const isChatLoading = isCreatingChatFor.has(userId);

              return (
                <div
                  key={userId || idx}
                  onClick={() => isSelectionMode && toggleSelected(userId)}
                  style={{
                    background: "#fff",
                    borderRadius: "24px",
                    padding: "24px",
                    border: isSelected
                      ? "2px solid #0f3d34"
                      : "1px solid rgba(15, 61, 52, 0.08)",
                    boxShadow: isSelected
                      ? "0 12px 24px rgba(15, 61, 52, 0.12)"
                      : "none",
                    transition: "all 0.2s ease",
                    cursor: isSelectionMode ? "pointer" : "default",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ display: "flex", gap: "20px", flex: 1 }}>
                      {isSelectionMode && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          style={{
                            width: "20px",
                            accentColor: "#0f3d34",
                            marginRight: "10px",
                          }}
                        />
                      )}

                      <div
                        style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "18px",
                          background: isUpdating ? "#f5f5f5" : info.bg,
                          color: isUpdating ? "#999" : info.color,
                          display: "grid",
                          placeItems: "center",
                          fontSize: "24px",
                          fontWeight: 800,
                          fontFamily: "Bebas Neue",
                          flexShrink: 0,
                        }}
                      >
                        {isUpdating
                          ? "..."
                          : (profile?.fullName?.[0] || "?").toUpperCase()}
                      </div>

                      <div style={{ flex: 1 }}>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "22px",
                            fontWeight: 800,
                            color: "#0f3d34",
                          }}
                        >
                          {profile?.fullName || "Candidate"}
                        </h3>
                        <p
                          style={{
                            margin: "4px 0 16px",
                            fontSize: "14px",
                            color: "#7b6f57",
                            fontWeight: 500,
                          }}
                        >
                          {profile?.headline || "No Headline"}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            gap: "20px",
                            flexWrap: "wrap",
                            marginBottom: isSelectionMode ? 0 : "20px",
                          }}
                        >
                          <ContactItem
                            Icon={Icons.Email}
                            text={profile?.email}
                          />
                          <ContactItem
                            Icon={Icons.Phone}
                            text={profile?.phone}
                          />
                          <ContactItem
                            Icon={Icons.Calendar}
                            text={
                              a?.applied_at
                                ? new Date(a.applied_at).toLocaleDateString()
                                : "Recently"
                            }
                          />
                        </div>

                        {!isSelectionMode && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/hotel/applicants/${userId}`);
                            }}
                            style={secondaryActionBtnStyle}
                          >
                            <Icons.User /> View Full Profile
                          </button>
                        )}
                      </div>
                    </div>

                    {!isSelectionMode && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "12px",
                        }}
                      >
                        <select
                          value={a?.status || "Pending"}
                          disabled={isUpdating}
                          onChange={(e) =>
                            doUpdateStatus(userId, e.target.value)
                          }
                          style={{
                            ...badgeSelectStyle,
                            color: isUpdating ? "#999" : info.color,
                            background: isUpdating ? "#f5f5f5" : info.bg,
                            opacity: isUpdating ? 0.7 : 1,
                            cursor: isUpdating ? "not-allowed" : "pointer",
                          }}
                        >
                          {STATUS_MENU.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {shouldShowChatButton(a?.status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openChatForApplicant(a);
                            }}
                            disabled={isChatLoading}
                            style={{
                              ...chatBtnStyle,
                              opacity: isChatLoading ? 0.6 : 1,
                              cursor: isChatLoading ? "not-allowed" : "pointer",
                            }}
                          >
                            <Icons.Chat />{" "}
                            {isChatLoading ? "Connecting..." : "Message"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLED COMPONENTS ---
const ContactItem = ({ Icon, text }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      color: "#7b6f57",
      fontSize: "13px",
    }}
  >
    <Icon />{" "}
    <span
      style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "180px",
      }}
    >
      {text || "N/A"}
    </span>
  </div>
);

const headerBtnStyle = {
  border: "none",
  background: "#f0f2f1",
  padding: "10px",
  borderRadius: "12px",
  cursor: "pointer",
  display: "flex",
  color: "#0f3d34",
};
const actionBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  border: "1px solid rgba(15, 61, 52, 0.15)",
  background: "#fff",
  padding: "10px 18px",
  borderRadius: "12px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "13px",
  transition: "0.2s",
};
const selectStyle = {
  padding: "10px",
  borderRadius: "12px",
  border: "1px solid #0f3d34",
  outline: "none",
  fontWeight: 700,
  color: "#0f3d34",
  cursor: "pointer",
};
const badgeSelectStyle = {
  border: "none",
  padding: "8px 16px",
  borderRadius: "99px",
  fontWeight: 800,
  fontSize: "12px",
  cursor: "pointer",
  outline: "none",
  textAlign: "center",
  transition: "all 0.2s",
};
const chatBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: "#0f3d34",
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  borderRadius: "12px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "13px",
};
const secondaryActionBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: "transparent",
  color: "#0f3d34",
  border: "1.5px solid #0f3d34",
  padding: "8px 16px",
  borderRadius: "12px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "13px",
  fontFamily: "Poppins",
};
const primaryBtnStyle = {
  background: "#0f3d34",
  color: "#fff",
  border: "none",
  padding: "12px 24px",
  borderRadius: "12px",
  fontWeight: 800,
  cursor: "pointer",
  marginTop: "12px",
};

function ShimmerApplicants() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: "140px",
            background: "#fff",
            borderRadius: "24px",
            animation: "pulse 1.5s infinite",
          }}
        />
      ))}
    </div>
  );
}
