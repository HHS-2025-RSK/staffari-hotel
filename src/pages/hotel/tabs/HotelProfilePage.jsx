import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { staffari } from "../../../theme/staffariTheme";
import { lsGet } from "../../../utils/storage";
import { getHotelProfile, saveBannerOnly } from "../../../api/hotelProfileApi";

// --- PREMIUM ICONS ---
const Icons = {
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
  Banner: () => (
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
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Options: () => (
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
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  ),
  Globe: () => (
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
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Map: () => (
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
  Logout: () => (
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Pin: () => (
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
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
};

export default function HotelProfilePage() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelectingBanner, setIsSelectingBanner] = useState(false);
  const [bannerImageUrl, setBannerImageUrl] = useState(null);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const openUrl = (url) => {
    if (!url) return;
    window.open(String(url), "_blank", "noopener,noreferrer");
  };

  const gallery = useMemo(() => {
    const g = profileData?.gallery_image_urls;
    return Array.isArray(g) ? g.filter(Boolean) : [];
  }, [profileData]);

  const heroImage = useMemo(() => {
    const persisted = (profileData?.banner_image_url ?? "").toString().trim();
    if (bannerImageUrl && String(bannerImageUrl).trim()) return bannerImageUrl;
    if (persisted) return persisted;
    if (gallery.length) return String(gallery[0] ?? "").trim() || null;
    return null;
  }, [bannerImageUrl, profileData, gallery]);

  const starRating = useMemo(() => {
    const v = profileData?.star_rating;
    const n = Number.parseInt(String(v ?? "0"), 10);
    return Number.isFinite(n) ? n : 0;
  }, [profileData]);

  const hotelName = useMemo(
    () => profileData?.hotel_name ?? profileData?.fullName ?? "Hotel",
    [profileData],
  );
  const initial = useMemo(
    () =>
      String(hotelName || "")
        .trim()[0]
        ?.toUpperCase() || "?",
    [hotelName],
  );

  const fetchProfile = async () => {
    setIsLoading(true);
    const userId = lsGet("uid", null);
    if (!userId) return navigate("/signin", { replace: true });

    try {
      const data = await getHotelProfile(userId);
      const prof = data?.data?.profile_data || {};
      if (!Object.keys(prof).length)
        return navigate("/hotel/profile/setup", { replace: true });
      const creds = data?.data?.credentials_data || {};
      const merged = { ...creds, ...prof };
      setProfileData(merged);
      setBannerImageUrl(
        merged.banner_image_url || merged.gallery_image_urls?.[0] || null,
      );
    } catch {
      navigate("/hotel/profile/setup", { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const saveBanner = async () => {
    const userId = lsGet("uid", null);
    try {
      await saveBannerOnly({
        userId,
        bannerImageUrl,
        galleryImageUrls: gallery,
        profilePicUrl: profileData?.profile_pic_url ?? null,
      });
      setIsSelectingBanner(false);
      alert("Banner updated");
      await fetchProfile();
    } catch {
      alert("Failed to update banner");
    }
  };

  const signOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/signin", { replace: true });
  };

  if (isLoading) return <LoadingShimmer />;

  return (
    <div style={{ minHeight: "100%", paddingBottom: "60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@400;600;700;800;900&display=swap');
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* HERO SECTION */}
      <div
        style={{
          position: "relative",
          height: "320px",
          borderRadius: "24px",
          overflow: "hidden",
          marginBottom: "40px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        {heroImage ? (
          <img
            src={heroImage}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{ width: "100%", height: "100%", background: "#0f3d34" }}
          />
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))",
          }}
        />

        {/* Hero Controls */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            display: "flex",
            gap: "12px",
          }}
        >
          <button
            onClick={() => setIsSelectingBanner(!isSelectingBanner)}
            style={glassBtnStyle}
            title="Change Banner"
          >
            <Icons.Banner />
          </button>
          <button
            onClick={() =>
              navigate("/hotel/profile/setup", {
                state: {
                  initialProfileData: buildInitialForSetup(
                    profileData,
                    bannerImageUrl,
                  ),
                },
              })
            }
            style={glassBtnStyle}
            title="Edit Profile"
          >
            <Icons.Edit />
          </button>
          <button
            onClick={() => setOptionsOpen(true)}
            style={glassBtnStyle}
            title="Options"
          >
            <Icons.Options />
          </button>
        </div>

        {/* Hero Identity */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            left: "40px",
            right: "40px",
            display: "flex",
            alignItems: "flex-end",
            gap: "24px",
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "24px",
              background: "#fff",
              border: "4px solid #fff",
              overflow: "hidden",
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
              display: "grid",
              placeItems: "center",
            }}
          >
            {profileData?.profile_pic_url ? (
              <img
                src={profileData.profile_pic_url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span
                style={{
                  fontFamily: "Bebas Neue",
                  fontSize: "40px",
                  color: "#0f3d34",
                }}
              >
                {initial}
              </span>
            )}
          </div>
          <div style={{ flex: 1, paddingBottom: "10px" }}>
            <h1
              style={{
                fontFamily: "Bebas Neue",
                fontSize: "48px",
                color: "#fff",
                margin: 0,
                letterSpacing: "1px",
                lineHeight: 1,
              }}
            >
              {hotelName}
            </h1>
            <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
              {Array.from({ length: starRating }).map((_, i) => (
                <span key={i} style={{ color: "#fbbf24", fontSize: "20px" }}>
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD CONTENT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 350px",
          gap: "32px",
          alignItems: "start",
        }}
      >
        {/* Left Column: Info Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <InfoSection title="About the Property">
            <p
              style={{
                color: "#4b5563",
                lineHeight: 1.6,
                fontSize: "15px",
                margin: "0 0 20px",
              }}
            >
              {profileData?.description || "No description provided."}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <KeyValue label="Property Type" value={profileData?.hotel_type} />
              <KeyValue
                label="Established"
                value={profileData?.year_established}
              />
              <KeyValue
                label="Total Rooms"
                value={profileData?.number_of_rooms}
              />
              <KeyValue
                label="Registration"
                value={profileData?.business_registration_number}
              />
            </div>
          </InfoSection>

          <InfoSection title="Amenities & Facilities">
            {profileData?.amenities?.length ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {profileData.amenities.map((a, i) => (
                  <span key={i} style={pillStyle}>
                    {String(a)}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: "#9ca3af", fontStyle: "italic" }}>
                Amenities not listed.
              </p>
            )}
          </InfoSection>

          <InfoSection title="Visual Gallery">
            {gallery.length ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: "16px",
                }}
              >
                {gallery.map((url, i) => (
                  <div
                    key={i}
                    onClick={() =>
                      isSelectingBanner ? setBannerImageUrl(url) : openUrl(url)
                    }
                    style={{
                      position: "relative",
                      height: "140px",
                      borderRadius: "16px",
                      overflow: "hidden",
                      cursor: "pointer",
                      border:
                        isSelectingBanner && bannerImageUrl === url
                          ? "4px solid #10b981"
                          : "2px solid transparent",
                    }}
                  >
                    <img
                      src={url}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    {isSelectingBanner && bannerImageUrl === url && (
                      <div style={badgeStyle}>
                        <Icons.Pin /> Banner
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#9ca3af", fontStyle: "italic" }}>
                No images found.
              </p>
            )}
          </InfoSection>
        </div>

        {/* Right Column: Contact & Meta */}
        <aside
          style={{ display: "flex", flexDirection: "column", gap: "24px" }}
        >
          <InfoSection title="Contact Info">
            <KeyValue label="Primary Email" value={profileData?.email} />
            <KeyValue label="Primary Phone" value={profileData?.phone} />
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {profileData?.website_url && (
                <button
                  onClick={() => openUrl(profileData.website_url)}
                  style={outlineActionBtn}
                >
                  <Icons.Globe /> Visit Website
                </button>
              )}
              {profileData?.google_maps_link && (
                <button
                  onClick={() => openUrl(profileData.google_maps_link)}
                  style={outlineActionBtn}
                >
                  <Icons.Map /> View on Maps
                </button>
              )}
            </div>
          </InfoSection>

          <InfoSection title="HR Representative">
            <KeyValue label="Name" value={profileData?.hr_contact_name} />
            <KeyValue
              label="Direct Email"
              value={profileData?.hr_contact_email}
            />
            <KeyValue
              label="Direct Phone"
              value={profileData?.hr_contact_phone}
            />
          </InfoSection>

          <InfoSection title="Location Detail">
            <KeyValue label="Address" value={profileData?.address_line_1} />
            <KeyValue
              label="City / State"
              value={`${profileData?.city}, ${profileData?.state}`}
            />
            <KeyValue label="Zip Code" value={profileData?.postal_code} />
          </InfoSection>
        </aside>
      </div>

      {/* FIXED SAVE FOOTER */}
      {isSelectingBanner && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            padding: "12px 32px",
            borderRadius: "100px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            zIndex: 1000,
            animation: "fadeIn 0.3s",
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: 700,
              color: "#0f3d34",
              fontSize: "14px",
            }}
          >
            Select a gallery image to update your banner
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setIsSelectingBanner(false)}
              style={{
                border: "none",
                background: "none",
                fontWeight: 700,
                color: "#7b6f57",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={saveBanner}
              style={{
                background: "#0f3d34",
                color: "#fff",
                border: "none",
                padding: "10px 24px",
                borderRadius: "50px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Save Banner
            </button>
          </div>
        </div>
      )}

      {/* OPTIONS MODAL */}
      {optionsOpen && (
        <div
          onClick={() => setOptionsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 61, 52, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 2000,
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "320px",
              background: "#fff",
              borderRadius: "24px",
              padding: "24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              style={{
                fontFamily: "Bebas Neue",
                fontSize: "24px",
                color: "#0f3d34",
                margin: "0 0 20px",
              }}
            >
              Options
            </h3>
            <button
              onClick={() => navigate("/delete-account")}
              style={sheetItemStyle}
            >
              Delete Account
            </button>
            <button
              onClick={signOut}
              style={{ ...sheetItemStyle, color: "#ef4444", border: "none" }}
            >
              <Icons.Logout /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---
function InfoSection({ title, children }) {
  return (
    <section
      style={{
        background: "#fff",
        borderRadius: "24px",
        padding: "28px",
        border: "2px solid rgba(15, 61, 52, 0.1)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
      }}
    >
      <h3
        style={{
          fontSize: "12px",
          fontWeight: 800,
          color: "#7b6f57",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          marginBottom: "24px",
          borderLeft: "3px solid #0f3d34",
          paddingLeft: "12px",
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function KeyValue({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          fontWeight: 800,
          color: "#9ca3af",
          textTransform: "uppercase",
          marginBottom: "4px",
        }}
      >
        {label}
      </label>
      <span
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: "#0f3d34",
          lineHeight: 1.4,
        }}
      >
        {String(value)}
      </span>
    </div>
  );
}

const LoadingShimmer = () => (
  <div style={{ padding: "40px", animation: "pulse 1.5s infinite" }}>
    <div
      style={{
        height: "300px",
        background: "#fff",
        borderRadius: "24px",
        marginBottom: "40px",
      }}
    />
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}
    >
      <div
        style={{ height: "400px", background: "#fff", borderRadius: "24px" }}
      />
      <div
        style={{ height: "400px", background: "#fff", borderRadius: "24px" }}
      />
    </div>
  </div>
);

// --- STYLES ---
const glassBtnStyle = {
  //   border: "none",
  background: "rgba(255,255,255,0.2)",
  backdropFilter: "blur(12px)",
  color: "#fff",
  padding: "12px",
  borderRadius: "14px",
  cursor: "pointer",
  display: "flex",
  border: "1px solid rgba(255,255,255,0.3)",
};
const pillStyle = {
  padding: "8px 16px",
  background: "#f0f2f1",
  color: "#0f3d34",
  borderRadius: "10px",
  fontSize: "13px",
  fontWeight: 700,
  border: "1px solid rgba(15, 61, 52, 0.05)",
};
const outlineActionBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  padding: "12px",
  borderRadius: "14px",
  border: "1.5px solid #0f3d34",
  background: "none",
  color: "#0f3d34",
  fontWeight: 700,
  fontSize: "14px",
  cursor: "pointer",
};
const sheetItemStyle = {
  width: "100%",
  textAlign: "left",
  padding: "16px",
  background: "none",
  borderBottom: "1px solid #f3f4f6",
  fontSize: "15px",
  fontWeight: 700,
  color: "#4b5563",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "12px",
};
const badgeStyle = {
  position: "absolute",
  top: "10px",
  left: "10px",
  padding: "4px 10px",
  background: "#10b981",
  color: "#fff",
  borderRadius: "8px",
  fontSize: "11px",
  fontWeight: 800,
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

function buildInitialForSetup(profileData, bannerImageUrl) {
  const d = { ...(profileData || {}) };
  return { ...d, banner_image_url: bannerImageUrl };
}
