import React, { useMemo, useState } from "react";
import { staffari } from "../../../theme/staffariTheme";
import { lsGet } from "../../../utils/storage";
import { editJob } from "../../../api/jobCrudApi";

// --- PREMIUM ICONS ---
const Icons = {
  Close: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Edit: () => (
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
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Save: () => (
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
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
};

export default function JobDetailsPage({ job, onClose, onSaved }) {
  const isHotelView = !!job?.hideApplyButton;
  const jobId = useMemo(
    () => (job?.id ?? job?.job_id ?? job?.jobId ?? job?._id ?? "").toString(),
    [job],
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState((job?.title ?? "").toString());
  const [description, setDescription] = useState(
    (job?.description ?? "").toString(),
  );
  const [company, setCompany] = useState((job?.company ?? "").toString());
  const [location, setLocation] = useState((job?.location ?? "").toString());
  const [salary, setSalary] = useState((job?.salary ?? "").toString());
  const [jobType, setJobType] = useState(
    (job?.jobtype ?? job?.jobType ?? "").toString(),
  );
  const [status, setStatus] = useState((job?.status ?? "open").toString());
  const [deadline, setDeadline] = useState(
    (job?.applicationdeadline ?? "").toString(),
  );

  const listToComma = (v) =>
    Array.isArray(v) ? v.map(String).join(", ") : (v ?? "").toString();
  const [benefits, setBenefits] = useState(listToComma(job?.benefits));
  const [amenities, setAmenities] = useState(listToComma(job?.amenities));
  const [certs, setCerts] = useState(listToComma(job?.requiredcertificates));

  const stringToList = (text) =>
    (text || "").trim()
      ? text
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
      : [];

  const saveChanges = async () => {
    if (!jobId) return alert("Job ID missing.");
    const userId = lsGet("uid", null);
    if (!userId) return alert("User not logged in.");
    if (
      !title.trim() ||
      !company.trim() ||
      !location.trim() ||
      !salary.trim() ||
      !jobType.trim() ||
      !deadline.trim()
    )
      return alert("All essential fields are required.");

    setIsLoading(true);
    try {
      const payload = {
        userid: userId,
        title,
        description,
        company,
        location,
        salary,
        jobtype: jobType,
        status,
        applicationdeadline: deadline,
        benefits: stringToList(benefits),
        amenities: stringToList(amenities),
        requiredcertificates: stringToList(certs),
      };
      await editJob(jobId, payload);
      alert("Job updated successfully!");
      setIsEditing(false);
      if (onSaved) onSaved();
      if (onClose) onClose();
    } catch (e) {
      alert(`Failed to update: ${String(e?.message || e)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        background: staffari.cardBackground,
        height: "95vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@400;600;700;800;900&display=swap');
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1.5px solid rgba(15, 61, 52, 0.08)",
        }}
      >
        <h2
          style={{
            fontFamily: "Bebas Neue",
            fontSize: "32px",
            color: "#0f3d34",
            margin: 0,
            letterSpacing: "1px",
          }}
        >
          {isEditing ? "Modify Listing" : "Vacancy Details"}
        </h2>
        <button onClick={onClose} style={closeBtnStyle} title="Close">
          <Icons.Close />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Section title="General Information">
            <Field
              label="Job Title"
              value={title}
              onChange={setTitle}
              editing={isEditing}
              headline
            />
            <Field
              label="Organization"
              value={company}
              onChange={setCompany}
              editing={isEditing}
            />
          </Section>

          <Section title="Detailed Description">
            <Field
              label="Role Overview"
              value={description}
              onChange={setDescription}
              editing={isEditing}
              textarea
            />
          </Section>

          <Section title="Logistics & Compensation">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              <Field
                label="Location"
                value={location}
                onChange={setLocation}
                editing={isEditing}
              />
              <Field
                label="Employment Type"
                value={jobType}
                onChange={setJobType}
                editing={isEditing}
              />
              <Field
                label="Expected Salary"
                value={salary}
                onChange={setSalary}
                editing={isEditing}
              />
              <Field
                label="Application Deadline"
                value={deadline}
                onChange={setDeadline}
                editing={isEditing}
                placeholder="YYYY-MM-DD"
              />
              <Field
                label="Posting Status"
                value={status}
                onChange={setStatus}
                editing={isEditing}
              />
            </div>
          </Section>

          {isEditing ? (
            <Section title="Tags & Requirements (Comma Separated)">
              <Field
                label="Perks & Benefits"
                value={benefits}
                onChange={setBenefits}
                editing
                textarea
              />
              <Field
                label="On-site Amenities"
                value={amenities}
                onChange={setAmenities}
                editing
                textarea
              />
              <Field
                label="Necessary Certifications"
                value={certs}
                onChange={setCerts}
                editing
                textarea
              />
            </Section>
          ) : (
            <>
              {!!job?.benefits?.length && (
                <TagSection title="Perks & Benefits" items={job.benefits} />
              )}
              {!!job?.amenities?.length && (
                <TagSection title="On-site Amenities" items={job.amenities} />
              )}
              {!!job?.requiredcertificates?.length && (
                <TagSection
                  title="Required Certifications"
                  items={job.requiredcertificates}
                />
              )}
            </>
          )}
          <div style={{ height: 40 }} />
        </div>
      </div>

      {/* Footer Actions */}
      <div
        style={{
          padding: "20px 32px",
          borderTop: "1.5px solid rgba(15, 61, 52, 0.08)",
          background: "#fff",
        }}
      >
        {isHotelView ? (
          isEditing ? (
            <div style={{ display: "flex", gap: "16px" }}>
              <button
                disabled={isLoading}
                onClick={saveChanges}
                style={primaryActionBtn}
              >
                <Icons.Save />{" "}
                {isLoading ? "Synchronizing..." : "Update Vacancy"}
              </button>
              <button
                disabled={isLoading}
                onClick={() => setIsEditing(false)}
                style={outlineActionBtn}
              >
                Discard
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} style={primaryActionBtn}>
              <Icons.Edit /> Edit Vacancy
            </button>
          )
        ) : (
          <button
            disabled
            style={{ ...primaryActionBtn, opacity: 0.5, cursor: "not-allowed" }}
          >
            Application Portal Closed
          </button>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <h3
        style={{
          fontSize: "12px",
          fontWeight: 800,
          color: "#7b6f57",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          marginBottom: "20px",
          borderLeft: "3px solid #0f3d34",
          paddingLeft: "12px",
        }}
      >
        {title}
      </h3>
      <div
        style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "20px",
          border: "1px solid rgba(15, 61, 52, 0.06)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function TagSection({ title, items }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h3
        style={{
          fontSize: "12px",
          fontWeight: 800,
          color: "#7b6f57",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          marginBottom: "16px",
        }}
      >
        {title}
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {items.map((it, idx) => (
          <span key={idx} style={pillStyle}>
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  editing,
  headline,
  textarea,
  placeholder,
}) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          fontWeight: 800,
          color: "#7b6f57",
          marginBottom: "8px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      {editing ? (
        textarea ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            style={inputStyle}
            placeholder={placeholder}
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={inputStyle}
            placeholder={placeholder}
          />
        )
      ) : (
        <div
          style={{
            fontFamily: headline ? "Poppins" : "Poppins",
            fontWeight: headline ? 800 : 600,
            fontSize: headline ? "24px" : "16px",
            color: "#0f3d34",
            whiteSpace: "pre-wrap",
            lineHeight: 1.5,
          }}
        >
          {value || "—"}
        </div>
      )}
    </div>
  );
}

// --- STYLES ---

const closeBtnStyle = {
  border: "none",
  background: "#f0f2f1",
  color: "#0f3d34",
  padding: "10px",
  borderRadius: "12px",
  cursor: "pointer",
  display: "flex",
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1.5px solid rgba(15, 61, 52, 0.1)",
  outline: "none",
  background: "#f9f8f6",
  fontFamily: "Poppins",
  fontWeight: 600,
  color: "#0f3d34",
  boxSizing: "border-box",
};

const primaryActionBtn = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  background: "#0f3d34",
  color: "#fff",
  border: "none",
  padding: "16px",
  borderRadius: "14px",
  fontFamily: "Poppins",
  fontWeight: 800,
  fontSize: "15px",
  cursor: "pointer",
  transition: "all 0.2s",
};

const outlineActionBtn = {
  padding: "16px 32px",
  background: "transparent",
  color: "#7b6f57",
  border: "none",
  fontFamily: "Poppins",
  fontWeight: 700,
  cursor: "pointer",
};

const pillStyle = {
  background: "#f0f2f1",
  color: "#0f3d34",
  padding: "8px 16px",
  borderRadius: "10px",
  fontSize: "13px",
  fontWeight: 700,
  border: "1px solid rgba(15, 61, 52, 0.05)",
};
