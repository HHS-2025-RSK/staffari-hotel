import React, { useEffect, useMemo, useRef, useState } from "react";
import { lsGet } from "../../../utils/storage";
import { fetchActiveJobsSummary } from "../../../api/hotelApplicantsApi";
import { useNavigate } from "react-router-dom";

// --- CONSTANTS ---
const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const departmentRoles = {
  "Front Office": [
    "Front Office Associate",
    "Guest Relations Executive",
    "Front Office Supervisor",
    "Front Office Manager",
    "Night Duty Manager",
    "Concierge",
  ],
  Housekeeping: [
    "Housekeeping Attendant",
    "Public Area Attendant",
    "Laundry Attendant",
    "Housekeeping Supervisor",
    "Executive Housekeeper",
  ],
  "Food & Beverage Service": [
    "Restaurant Server",
    "Host/Hostess",
    "Room Service Associate",
    "Restaurant Supervisor",
    "Restaurant Manager",
  ],
  "Bar/Beverage": [
    "Bar Back",
    "Bartender",
    "Bar Supervisor",
    "Beverage Manager",
  ],
  "Culinary/Kitchen": [
    "Commis",
    "Demi Chef de Partie",
    "Chef de Partie",
    "Sous Chef",
    "Executive Chef",
  ],
  "Bakery & Pastry": [
    "Bakery Commis",
    "Pastry Commis",
    "Pastry Chef de Partie",
    "Pastry Sous Chef",
    "Head Pastry Chef",
  ],
  "Banquets/Events": [
    "Banquet Server",
    "Banquet Captain",
    "Banquet Supervisor",
    "Banquet Manager",
  ],
  "Reservations & Revenue": [
    "Reservations Agent",
    "Reservations Supervisor",
    "Revenue Analyst",
    "Revenue Manager",
  ],
  "Sales & Marketing": [
    "Sales Coordinator",
    "Sales Executive",
    "Sales Manager",
    "Marketing Executive",
  ],
  "Spa & Wellness": [
    "Spa Receptionist",
    "Spa Therapist",
    "Spa Supervisor",
    "Spa Manager",
  ],
  "Security/Loss Prevention": [
    "Security Officer",
    "Security Supervisor",
    "Loss Prevention Manager",
  ],
  "Engineering/Maintenance": [
    "Maintenance Technician",
    "HVAC Technician",
    "Engineering Supervisor",
    "Chief Engineer",
  ],
  "IT/Systems": ["IT Support", "IT Executive", "Systems Administrator"],
  "Finance & Accounts": [
    "Accounts Payable Executive",
    "Accounts Receivable Executive",
    "Income Auditor",
    "Assistant Finance Manager",
  ],
  "Procurement/Stores": [
    "Storekeeper",
    "Purchasing Executive",
    "Purchasing Manager",
  ],
  "HR/Training": ["HR Executive", "Training Coordinator", "HR Manager"],
  Laundry: ["Laundry Attendant", "Laundry Supervisor"],
  "Transport/Logistics": ["Driver", "Transport Coordinator"],
};

// --- ICONS ---
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
  Applicants: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Accepted: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Pending: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  ChevronRight: () => (
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
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Alert: () => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#E53935"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Briefcase: () => (
    <svg
      width="48"
      height="48"
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
};

// --- MAIN COMPONENT ---
export default function JobApplicantsDashboardPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [totalApplicants, setTotalApplicants] = useState(0);
  const [totalAccepted, setTotalAccepted] = useState(0);
  const [totalPendingOrRejected, setTotalPendingOrRejected] = useState(0);

  const [department, setDepartment] = useState(null);
  const [location, setLocation] = useState(null);
  const [includeExpired, setIncludeExpired] = useState(true);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterModalKey, setFilterModalKey] = useState(0);
  const [reloadTick, setReloadTick] = useState(0);

  const scrollRef = useRef(null);

  const deptItems = useMemo(
    () => Object.keys(departmentRoles).slice().sort(),
    [],
  );
  const stateItems = useMemo(() => indianStates.slice().sort(), []);

  const normalizeJobs = (jobs) => {
    const list = Array.isArray(jobs) ? jobs : [];
    return list.map((job) => ({
      jobData: job,
      applicantCount: Number(job?.applicants_count ?? 0) || 0,
    }));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchActiveJobsSummary({
          page: 1,
          limit,
          includeExpired,
          department,
          location,
        });
        if (cancelled) return;
        setItems(normalizeJobs(result.jobs));
        setHasMore(!!result.hasMore);
        setPage(1);
        setTotalApplicants(result.totalApplicants);
        setTotalAccepted(result.totalAccepted);
        setTotalPendingOrRejected(result.totalPendingOrRejected);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e);
        setItems([]);
      } finally {
        setIsFirstLoad(false);
        setIsLoadingMore(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [department, location, includeExpired, reloadTick]);

  const loadNextPageIfNeeded = async () => {
    if (
      isFirstLoad ||
      isLoadingMore ||
      !hasMore ||
      (error && items.length === 0)
    )
      return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await fetchActiveJobsSummary({
        page: nextPage,
        limit,
        includeExpired,
        department,
        location,
      });
      setPage(nextPage);
      setItems((prev) => prev.concat(normalizeJobs(result.jobs)));
      setHasMore(!!result.hasMore);
    } catch (e) {
      setError(e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop >= el.scrollHeight - el.clientHeight - 250)
        loadNextPageIfNeeded();
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [isFirstLoad, isLoadingMore, hasMore, page, error, items.length]);

  const hotelId = lsGet("uid", null);

  const openJob = (item) => {
    const jobId =
      item?.jobData?.id ?? item?.jobData?.jobid ?? item?.jobData?._id;
    navigate(`/hotel/applications/${encodeURIComponent(String(jobId || ""))}`, {
      state: { selectedJobData: item },
    });
  };

  const openFilters = () => {
    setFilterModalKey((k) => k + 1);
    setIsFilterOpen(true);
  };

  const clearFilters = () => {
    setDepartment(null);
    setLocation(null);
    setIncludeExpired(true);
    setIsFilterOpen(false);
    setIsFirstLoad(true);
    setItems([]);
    setPage(1);
    setReloadTick((t) => t + 1);
  };

  const applyFilters = ({ department: d, location: l, includeExpired: ie }) => {
    setDepartment(d || null);
    setLocation(l || null);
    setIncludeExpired(!!ie);
    setIsFilterOpen(false);
    setIsFirstLoad(true);
    setItems([]);
    setPage(1);
    setReloadTick((t) => t + 1);
  };

  const retry = () => {
    setIsFirstLoad(true);
    setError(null);
    setItems([]);
    setReloadTick((t) => t + 1);
  };

  return (
    <div style={{ minHeight: "100%" }}>
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
            Job Postings
          </h1>
          <p
            style={{
              margin: 0,
              color: "#7b6f57",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Manage your active listings and track applicant progress.
          </p>
        </div>

        <button
          onClick={openFilters}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#fff",
            border: "1px solid rgba(15, 61, 52, 0.1)",
            padding: "10px 20px",
            borderRadius: "12px",
            cursor: "pointer",
            color: "#0f3d34",
            fontWeight: 700,
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#f0f2f1")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
        >
          <Icons.Filter />
          Filters
        </button>
      </div>

      {/* STATS SECTION */}
      {!isFirstLoad && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          <StatCard
            title="Total Applicants"
            value={totalApplicants}
            Icon={Icons.Applicants}
            color="#0f3d34"
          />
          <StatCard
            title="Accepted"
            value={totalAccepted}
            Icon={Icons.Accepted}
            color="#10b981"
          />
          <StatCard
            title="Pending"
            value={totalPendingOrRejected}
            Icon={Icons.Pending}
            color="#f59e0b"
          />
        </div>
      )}

      {/* CONTENT LIST */}
      <div
        ref={scrollRef}
        style={{
          paddingRight: "8px",
        }}
      >
        {isFirstLoad ? (
          <ShimmerList />
        ) : error && items.length === 0 ? (
          <ErrorWidget error={error} onRetry={retry} />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {items.map((it, idx) => (
              <JobCard
                key={it?.jobData?.id || idx}
                item={it}
                onOpen={() => openJob(it)}
              />
            ))}

            {isLoadingMore && (
              <div
                style={{
                  textAlign: "center",
                  padding: "24px",
                  color: "#0f3d34",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                Fetching more talent...
              </div>
            )}
          </div>
        )}
      </div>

      {/* FILTER MODAL */}
      {isFilterOpen && (
        <FilterModal
          key={filterModalKey}
          onClose={() => setIsFilterOpen(false)}
          deptItems={deptItems}
          stateItems={stateItems}
          initial={{ department, location, includeExpired }}
          onClear={clearFilters}
          onApply={applyFilters}
          disabled={!hotelId}
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ title, value, Icon, color }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "24px",
        borderRadius: "20px",
        border: "1px solid rgba(15, 61, 52, 0.05)",
        boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "12px",
          color: "#7b6f57",
        }}
      >
        <div style={{ color }}>
          {" "}
          <Icon />{" "}
        </div>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ fontSize: "32px", fontWeight: 800, color: "#0f3d34" }}>
        {value}
      </div>
    </div>
  );
}

function JobCard({ item, onOpen }) {
  const job = item?.jobData || {};
  return (
    <div
      onClick={onOpen}
      style={{
        background: "#fff",
        padding: "20px 24px",
        borderRadius: "16px",
        border: "1px solid rgba(15, 61, 52, 0.08)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(15, 61, 52, 0.08)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ flex: 1 }}>
        <h3
          style={{
            margin: "0 0 4px",
            fontSize: "18px",
            fontWeight: 800,
            color: "#0f3d34",
          }}
        >
          {job?.title ?? "No Title"}
        </h3>
        <div
          style={{
            display: "flex",
            gap: "12px",
            fontSize: "14px",
            color: "#7b6f57",
            fontWeight: 500,
          }}
        >
          <span>{job?.company || "Hotel Member"}</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>{job?.location || "India"}</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f3d34" }}>
            {item.applicantCount}
          </div>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#7b6f57",
              textTransform: "uppercase",
            }}
          >
            Applicants
          </div>
        </div>
        <div style={{ color: "rgba(15, 61, 52, 0.2)" }}>
          {" "}
          <Icons.ChevronRight />{" "}
        </div>
      </div>
    </div>
  );
}

function ShimmerList() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            height: "90px",
            borderRadius: "16px",
            background: "#f5f5f5",
            animation: "pulse 1.5s infinite ease-in-out",
          }}
        />
      ))}
      <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div
        style={{
          color: "#7b6f57",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Icons.Briefcase />
      </div>
      <h2
        style={{
          fontFamily: "Bebas Neue",
          fontSize: "28px",
          color: "#0f3d34",
          margin: 0,
        }}
      >
        No Jobs Posted
      </h2>
      <p style={{ color: "#7b6f57", fontSize: "14px" }}>
        Post your first vacancy to start hunting for the right talent.
      </p>
    </div>
  );
}

function ErrorWidget({ error, onRetry }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Icons.Alert />
      </div>
      <h3
        style={{
          fontSize: "18px",
          fontWeight: 800,
          color: "#0f3d34",
          margin: "0 0 8px",
        }}
      >
        Connection Error
      </h3>
      <p style={{ color: "#7b6f57", fontSize: "14px", margin: "0 0 20px" }}>
        {error?.message || "Could not load data."}
      </p>
      <button
        onClick={onRetry}
        style={{
          padding: "10px 24px",
          borderRadius: "12px",
          background: "#0f3d34",
          color: "#fff",
          border: "none",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Try Again
      </button>
    </div>
  );
}

function FilterModal({
  onClose,
  deptItems,
  stateItems,
  initial,
  onClear,
  onApply,
  disabled,
}) {
  const [dept, setDept] = useState(initial.department || "");
  const [state, setState] = useState(initial.location || "");
  const [includeExpired, setIncludeExpired] = useState(
    !!initial.includeExpired,
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 61, 52, 0.4)",
        zIndex: 1000,
        display: "grid",
        placeItems: "center",
        padding: "20px",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          width: "min(420px, 100%)",
          background: "#fff",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontFamily: "Bebas Neue",
              fontSize: "28px",
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
              cursor: "pointer",
              fontSize: "20px",
              color: "#0f3d34",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 800,
              color: "#7b6f57",
              marginBottom: "8px",
            }}
          >
            DEPARTMENT
          </label>
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            style={selectStyle}
          >
            <option value="">All Departments</option>
            {deptItems.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 800,
              color: "#7b6f57",
              marginBottom: "8px",
            }}
          >
            LOCATION
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            style={selectStyle}
          >
            <option value="">Across India</option>
            {stateItems.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            marginBottom: "32px",
          }}
        >
          <input
            type="checkbox"
            checked={includeExpired}
            onChange={(e) => setIncludeExpired(e.target.checked)}
            style={{ accentColor: "#0f3d34", width: "18px", height: "18px" }}
          />
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#0f3d34" }}>
            Show Expired Postings
          </span>
        </label>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            disabled={disabled}
            onClick={onClear}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid #0f3d34",
              background: "none",
              color: "#0f3d34",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Clear
          </button>
          <button
            disabled={disabled}
            onClick={() =>
              onApply({ department: dept, location: state, includeExpired })
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

const selectStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(15, 61, 52, 0.15)",
  fontSize: "15px",
  fontFamily: "Poppins",
  outline: "none",
  background: "#f9f8f6",
  color: "#0f3d34",
};
