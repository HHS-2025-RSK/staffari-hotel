import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { lsGet } from "../../../utils/storage";
import { fetchJobseekers } from "../../../api/jobseekersApi";

// --- CONSTANTS ---
const LIMIT = 20;

const availabilityOptions = [
  "Any",
  "Available Immediately",
  "Available Within 1 Week",
  "Available Within 2 Weeks",
  "Available Within 1 Month",
  "Available After 1 Month",
  "Currently Employed – Open to Offers",
  "Only Available on Weekends",
  "Only Part-Time Available",
  "Not Currently Available",
  "Available Upon Notice Period (e.g., 2 weeks, 1 month)",
  "Others/Specify",
];

const employmentStatusOptions = [
  "Any",
  "Employed",
  "Unemployed",
  "Open to Opportunities",
];

const departmentOptions = [
  "Any",
  "Front Office",
  "Housekeeping",
  "Food & Beverage Service",
  "Bar/Beverage",
  "Culinary/Kitchen",
  "Bakery & Pastry",
  "Banquets/Events",
  "Reservations & Revenue",
  "Sales & Marketing",
  "Spa & Wellness",
  "Security/Loss Prevention",
  "Engineering/Maintenance",
  "IT/Systems",
  "Finance & Accounts",
  "Procurement/Stores",
  "HR/Training",
  "Laundry",
  "Transport/Logistics",
];

// --- PREMIUM ICONS ---
const Icons = {
  Filter: () => (
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
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  Refresh: () => (
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
      <path d="M23 4v6h-6" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  User: () => (
    <svg
      width="24"
      height="24"
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
  Check: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ChevronDown: () => (
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
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevronUp: () => (
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
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ),
  MapPin: () => (
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
};

// --- HELPERS ---
function s(v) {
  if (v == null) return null;
  const t = String(v).trim();
  return t ? t : null;
}
function listStr(v) {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x ?? "").trim()).filter(Boolean);
}
function openExternal(url) {
  const u = s(url);
  if (!u) return;
  window.open(u, "_blank", "noopener,noreferrer");
}

export default function SearchJobseekersPage() {
  const navigate = useNavigate();
  const listRef = useRef(null);

  const [hotelId, setHotelId] = useState(null);
  const [jobseekers, setJobseekers] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalMatching, setTotalMatching] = useState(0);

  // Filters
  const [location, setLocation] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [selectedEmploymentStatus, setSelectedEmploymentStatus] =
    useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const uid = lsGet("uid", null);
    if (!uid) {
      setIsFirstLoad(false);
      navigate("/signin", { replace: true });
      return;
    }
    setHotelId(uid);
  }, [navigate]);

  const queryArgs = useMemo(() => {
    if (!hotelId) return null;
    return {
      hotelId,
      page: 1,
      limit: LIMIT,
      location,
      availability: selectedAvailability,
      employmentStatus: selectedEmploymentStatus,
      department: selectedDepartment,
    };
  }, [
    hotelId,
    location,
    selectedAvailability,
    selectedEmploymentStatus,
    selectedDepartment,
  ]);

  const loadFirstPage = async () => {
    if (!hotelId) return;
    setIsFirstLoad(true);
    setIsLoadingMore(false);
    setError(null);
    setJobseekers([]);
    setPage(1);
    setHasMore(true);
    try {
      const data = await fetchJobseekers({
        hotelId,
        page: 1,
        limit: LIMIT,
        location,
        availability: selectedAvailability,
        employmentStatus: selectedEmploymentStatus,
        department: selectedDepartment,
      });
      setJobseekers(Array.isArray(data?.jobseekers) ? data.jobseekers : []);
      setHasMore(data?.has_more === true);
      setTotalMatching(Number(data?.total_matching ?? 0) || 0);
    } catch (e) {
      setError(e);
    } finally {
      setIsFirstLoad(false);
    }
  };

  useEffect(() => {
    if (queryArgs) loadFirstPage();
  }, [queryArgs]);

  const loadNextPageIfNeeded = async () => {
    if (isFirstLoad || isLoadingMore || !hasMore || error || !hotelId) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await fetchJobseekers({
        hotelId,
        page: nextPage,
        limit: LIMIT,
        location,
        availability: selectedAvailability,
        employmentStatus: selectedEmploymentStatus,
        department: selectedDepartment,
      });
      setJobseekers((prev) =>
        prev.concat(Array.isArray(data?.jobseekers) ? data.jobseekers : []),
      );
      setHasMore(data?.has_more === true);
      setPage(nextPage);
    } catch (e) {
      setError(e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const onScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 250)
      loadNextPageIfNeeded();
  };

  const clearFilters = () => {
    setLocation("");
    setSelectedAvailability(null);
    setSelectedEmploymentStatus(null);
    setSelectedDepartment(null);
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@400;600;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
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
            Search Talent
          </h1>
          <p
            style={{
              margin: 0,
              color: "#7b6f57",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {!isFirstLoad && totalMatching > 0
              ? `${totalMatching} qualified candidates matching your criteria`
              : "Discover elite hospitality professionals"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => setFilterOpen(true)}
            style={iconBtn()}
            title="Filters"
          >
            <Icons.Filter /> <span style={{ marginLeft: "8px" }}>Filters</span>
          </button>
          <button onClick={loadFirstPage} style={iconBtn()} title="Refresh">
            <Icons.Refresh />
          </button>
        </div>
      </div>

      {/* List */}
      <div
        ref={listRef}
        onScroll={onScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: "8px",
          scrollBehavior: "smooth",
        }}
      >
        {isFirstLoad ? (
          <ShimmerList />
        ) : error && jobseekers.length === 0 ? (
          <ErrorState error={error} onRetry={loadFirstPage} />
        ) : jobseekers.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {jobseekers.map((seeker, idx) => (
              <JobseekerCard
                key={(seeker?.id ?? seeker?.uid ?? idx) + ""}
                seeker={seeker}
                onOpenProfile={(id) => navigate(`/hotel/applicants/${id}`)}
              />
            ))}

            {isLoadingMore && (
              <div
                style={{
                  padding: "30px",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: "3px solid #f3f3f3",
                    borderTopColor: "#0f3d34",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </div>
            )}
            <div style={{ height: 40 }} />
          </div>
        )}
      </div>

      {/* Filter sheet */}
      {filterOpen && (
        <FilterSheet
          initial={{
            location,
            availability: selectedAvailability,
            employmentStatus: selectedEmploymentStatus,
            department: selectedDepartment,
          }}
          onClose={() => setFilterOpen(false)}
          onClear={() => {
            setFilterOpen(false);
            clearFilters();
          }}
          onApply={(v) => {
            setFilterOpen(false);
            setLocation(v.location);
            setSelectedAvailability(v.availability);
            setSelectedEmploymentStatus(v.employmentStatus);
            setSelectedDepartment(v.department);
          }}
        />
      )}
    </div>
  );
}

function JobseekerCard({ seeker, onOpenProfile }) {
  const [open, setOpen] = useState(false);
  const id = s(seeker?.id);
  const name = s(seeker?.fullName) || "Anonymous Candidate";
  const headline = s(seeker?.headline) || "Professional Hospitality Member";
  const department = s(seeker?.department) || "General";
  const expYears = seeker?.experience_years ?? 0;
  const location = s(seeker?.location) || "Not Specified";
  const availability = s(seeker?.availability) || "Contact for Availability";
  const status = s(seeker?.employment_status) || "N/A";
  const profilePic = s(seeker?.profile_pic_url);
  const banner = s(seeker?.banner_image_url);
  const resumeUrl = s(seeker?.resume_url);
  const videoCvUrl = s(seeker?.video_cv_url);
  const verified = seeker?.isEmailVerified === true;
  const skills = listStr(seeker?.skills);
  const languages = listStr(seeker?.languages);

  const infoRow = (Icon, label, value) => {
    if (!value || value === "N/A") return null;
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          color: "#555",
        }}
      >
        <div style={{ color: "#7b6f57" }}>
          <Icon />
        </div>
        <span style={{ fontWeight: 500 }}>{label}:</span>
        <span style={{ fontWeight: 700, color: "#0f3d34" }}>{value}</span>
      </div>
    );
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "24px",
        border: "1px solid rgba(15, 61, 52, 0.08)",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: open
          ? "0 12px 30px rgba(15, 61, 52, 0.1)"
          : "0 2px 4px rgba(0,0,0,0.02)",
      }}
    >
      {banner && (
        <div style={{ height: "100px", width: "100%", overflow: "hidden" }}>
          <img
            src={banner}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.8,
            }}
          />
        </div>
      )}

      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "#f0f2f1",
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              border: "3px solid #fff",
              marginTop: banner ? "-45px" : "0",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            {profilePic ? (
              <img
                src={profilePic}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ color: "#0f3d34" }}>
                <Icons.User />
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#0f3d34",
                }}
              >
                {name}
              </h2>
              {verified && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#10b981",
                    color: "#fff",
                    padding: "2px 8px",
                    borderRadius: "20px",
                    fontSize: "10px",
                    fontWeight: 800,
                  }}
                >
                  <Icons.Check />{" "}
                  <span style={{ marginLeft: "4px" }}>VERIFIED</span>
                </div>
              )}
            </div>
            <p
              style={{
                margin: "4px 0",
                fontSize: "14px",
                color: "#7b6f57",
                fontWeight: 600,
              }}
            >
              {headline}
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "#0f3d34",
                marginTop: "8px",
              }}
            >
              <span>{department}</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span>{expYears} Years Experience</span>
            </div>
          </div>

          <button onClick={() => onOpenProfile(id)} style={primaryActionBtn()}>
            View Profile
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          {infoRow(Icons.MapPin, "Location", location)}
          {infoRow(
            () => (
              <Icons.Check style={{ width: 14, height: 14 }} />
            ),
            "Availability",
            availability,
          )}
        </div>

        {open && (
          <div
            style={{
              marginTop: "24px",
              paddingTop: "24px",
              borderTop: "1px dashed rgba(123,111,87,0.2)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {infoRow(
                () => (
                  <Icons.Check style={{ width: 12 }} />
                ),
                "Employment",
                status,
              )}
              {s(seeker?.state) && infoRow(Icons.MapPin, "State", seeker.state)}
            </div>

            {skills.length > 0 && (
              <Chips title="Core Competencies" items={skills} />
            )}
            {languages.length > 0 && (
              <Chips title="Languages" items={languages} />
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              {resumeUrl && (
                <button
                  onClick={() => openExternal(resumeUrl)}
                  style={outlineActionBtn()}
                >
                  Curriculum Vitae
                </button>
              )}
              {videoCvUrl && (
                <button
                  onClick={() => openExternal(videoCvUrl)}
                  style={outlineActionBtn()}
                >
                  Watch Video CV
                </button>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            color: "#7b6f57",
            fontWeight: 800,
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginTop: "20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {open ? (
            <>
              Less Details <Icons.ChevronUp />
            </>
          ) : (
            <>
              More Details <Icons.ChevronDown />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Chips({ title, items }) {
  return (
    <div style={{ marginTop: "16px" }}>
      <p
        style={{
          margin: "0 0 8px",
          fontSize: "11px",
          fontWeight: 800,
          color: "#7b6f57",
          textTransform: "uppercase",
        }}
      >
        {title}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {items.map((it) => (
          <span
            key={it}
            style={{
              padding: "6px 14px",
              borderRadius: "10px",
              background: "#f0f2f1",
              color: "#0f3d34",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

function FilterSheet({ initial, onClose, onClear, onApply }) {
  const [tempLocation, setTempLocation] = useState(initial.location ?? "");
  const [tempAvailability, setTempAvailability] = useState(
    initial.availability ?? "Any",
  );
  const [tempEmployment, setTempEmployment] = useState(
    initial.employmentStatus ?? "Any",
  );
  const [tempDepartment, setTempDepartment] = useState(
    initial.department ?? "Any",
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 61, 52, 0.4)",
        zIndex: 3000,
        display: "grid",
        placeItems: "center",
        backdropFilter: "blur(4px)",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(480px, 100%)",
          background: "#fff",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <h2
            style={{
              fontFamily: "Bebas Neue",
              fontSize: "32px",
              color: "#0f3d34",
              margin: 0,
            }}
          >
            Filter Talent
          </h2>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <FilterField label="Location">
          <input
            value={tempLocation}
            onChange={(e) => setTempLocation(e.target.value)}
            style={inputStyle()}
            placeholder="City or State"
          />
        </FilterField>

        <FilterField label="Availability">
          <select
            value={tempAvailability}
            onChange={(e) => setTempAvailability(e.target.value)}
            style={inputStyle()}
          >
            {availabilityOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Employment Status">
          <select
            value={tempEmployment}
            onChange={(e) => setTempEmployment(e.target.value)}
            style={inputStyle()}
          >
            {employmentStatusOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Department">
          <select
            value={tempDepartment}
            onChange={(e) => setTempDepartment(e.target.value)}
            style={inputStyle()}
          >
            {departmentOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </FilterField>

        <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
          <button
            onClick={onClear}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              border: "1.5px solid #0f3d34",
              background: "none",
              color: "#0f3d34",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Clear All
          </button>
          <button
            onClick={() =>
              onApply({
                location: tempLocation,
                availability:
                  tempAvailability === "Any" ? null : tempAvailability,
                employmentStatus:
                  tempEmployment === "Any" ? null : tempEmployment,
                department: tempDepartment === "Any" ? null : tempDepartment,
              })
            }
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: "#0f3d34",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

const FilterField = ({ label, children }) => (
  <div style={{ marginBottom: "20px" }}>
    <label
      style={{
        display: "block",
        fontSize: "11px",
        fontWeight: 800,
        color: "#7b6f57",
        textTransform: "uppercase",
        marginBottom: "8px",
        letterSpacing: "0.5px",
      }}
    >
      {label}
    </label>
    {children}
  </div>
);

// --- STYLES ---
const iconBtn = () => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  border: "1.5px solid rgba(15, 61, 52, 0.1)",
  background: "#fff",
  borderRadius: "12px",
  padding: "10px 16px",
  cursor: "pointer",
  fontWeight: 700,
  color: "#0f3d34",
  fontSize: "14px",
});
const primaryActionBtn = () => ({
  background: "#0f3d34",
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  borderRadius: "12px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "14px",
  fontFamily: "Poppins",
});
const outlineActionBtn = () => ({
  background: "#fff",
  color: "#0f3d34",
  border: "1.5px solid #0f3d34",
  padding: "10px 20px",
  borderRadius: "12px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "13px",
  fontFamily: "Poppins",
});
const inputStyle = () => ({
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid rgba(15, 61, 52, 0.15)",
  fontSize: "15px",
  fontFamily: "Poppins",
  outline: "none",
  background: "#f9f8f6",
  color: "#0f3d34",
});

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
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }`}</style>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: "64px", marginBottom: "20px" }}>🔍</div>
      <h2
        style={{
          fontFamily: "Bebas Neue",
          fontSize: "32px",
          color: "#0f3d34",
          margin: 0,
        }}
      >
        No Candidates Found
      </h2>
      <p style={{ color: "#7b6f57", fontSize: "14px" }}>
        We couldn't find any talent matching those specific filters.
      </p>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
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
      <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f3d34" }}>
        Something went wrong
      </h3>
      <p style={{ color: "#7b6f57", fontSize: "14px", marginBottom: "24px" }}>
        {error?.message || "Check your internet connection."}
      </p>
      <button onClick={onRetry} style={primaryActionBtn()}>
        Try Again
      </button>
    </div>
  );
}
