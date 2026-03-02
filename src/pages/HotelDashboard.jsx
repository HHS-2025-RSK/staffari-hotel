import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { staffari } from "../theme/staffariTheme";
import { lsGet } from "../utils/storage";

import JobApplicantsDashboardPage from "./hotel/tabs/JobApplicantsDashboardPage";
import HotelJobsPage from "./hotel/tabs/HotelJobsPage";
import HotelProfilePage from "./hotel/tabs/HotelProfilePage";
import SearchJobseekersPage from "./hotel/tabs/SearchJobseekersPage";

// Premium SVG Icons
const Icons = {
  Applications: () => (
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Jobs: () => (
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
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Search: () => (
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Profile: () => (
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Chat: () => (
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

export default function HotelDashboard() {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [hotelName] = useState(() => lsGet("fullName", "Hotel") || "Hotel");
  const [email] = useState(() => lsGet("email", "No email") || "No email");
  const [hotelId] = useState(() => lsGet("uid", null));

  const tabs = useMemo(
    () => [
      {
        key: "applications",
        label: "Applications",
        Icon: Icons.Applications,
        node: <JobApplicantsDashboardPage hotelId={hotelId} email={email} />,
      },
      {
        key: "jobs",
        label: "My Jobs",
        Icon: Icons.Jobs,
        node: <HotelJobsPage hotelId={hotelId} email={email} />,
      },
      {
        key: "search",
        label: "Find Talent",
        Icon: Icons.Search,
        node: <SearchJobseekersPage hotelId={hotelId} email={email} />,
      },
      {
        key: "profile",
        label: "Hotel Profile",
        Icon: Icons.Profile,
        node: <HotelProfilePage hotelId={hotelId} email={email} />,
      },
    ],
    [hotelId, email],
  );

  if (!hotelId) return null;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: staffari.earthyBeige,
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@400;600;800&display=swap');`}</style>

      {/* FIXED SIDEBAR */}
      <aside
        style={{
          width: "260px",
          background: "#fff",
          borderRight: "1px solid rgba(15, 61, 52, 0.08)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          height: "100vh",
          zIndex: 100,
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: "40px 24px" }}>
          <h1
            style={{
              fontFamily: "Bebas Neue",
              fontSize: "36px",
              color: "#0f3d34",
              margin: 0,
              letterSpacing: "2px",
              lineHeight: 0.8,
            }}
          >
            STAFFARI
          </h1>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#0f3d34",
              margin: "8px 0 0",
              textTransform: "uppercase",
              opacity: 0.6,
              letterSpacing: "0.5px",
            }}
          >
            Hunt Smart. Hire Right.
          </p>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: "0 16px" }}>
          {tabs.map((t, idx) => {
            const active = idx === selectedIndex;
            return (
              <button
                key={t.key}
                onClick={() => setSelectedIndex(idx)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 18px",
                  margin: "6px 0",
                  border: "none",
                  borderRadius: "14px",
                  cursor: "pointer",
                  transition: "0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: active ? "#0f3d34" : "transparent",
                  color: active ? "#fff" : "#0f3d34",
                }}
              >
                <t.Icon />
                <span
                  style={{ fontWeight: active ? 700 : 500, fontSize: "15px" }}
                >
                  {t.label}
                </span>
              </button>
            );
          })}

          {/* CHATS MOVED HERE */}
          <div
            style={
              {
                // margin: "20px 0",
                // borderTop: "1px solid rgba(15, 61, 52, 0.05)",
                // paddingTop: "20px",
              }
            }
          >
            <button
              onClick={() =>
                navigate("/hotel/chats", { state: { hotelId, email } })
              }
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 18px",
                border: "none",
                borderRadius: "14px",
                cursor: "pointer",
                background: "transparent",
                color: "#0f3d34",
                transition: "0.2s all",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(15, 61, 52, 0.05)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <Icons.Chat />
              <span style={{ fontWeight: 500, fontSize: "15px" }}>
                Messages
              </span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer (Profile) */}
        <div style={{ padding: "24px", background: "rgba(15, 61, 52, 0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#0f3d34",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: "18px",
                boxShadow: "0 4px 12px rgba(15, 61, 52, 0.2)",
              }}
            >
              {hotelName[0]}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#0f3d34",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {hotelName}
              </div>
              <div style={{ fontSize: "12px", color: "#7b6f57", opacity: 0.8 }}>
                Hotel Administrator
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ marginLeft: "260px", flex: 1 }}>
        {/* Top Header */}
        <header
          style={{
            height: "80px",
            display: "flex",
            alignItems: "center",
            padding: "0 48px",
            background: "transparent",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#0f3d34",
              margin: 0,
            }}
          >
            {tabs[selectedIndex].label}
          </h2>
        </header>

        {/* Page Container */}
        <div style={{ padding: "0 48px 48px", maxWidth: "1400px" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: "24px",
              padding: "32px",
              minHeight: "calc(100vh - 160px)",
              boxShadow: "0 4px 24px rgba(15, 61, 52, 0.03)",
              border: "1px solid rgba(15, 61, 52, 0.05)",
            }}
          >
            {tabs[selectedIndex]?.node}
          </div>
        </div>
      </main>
    </div>
  );
}
