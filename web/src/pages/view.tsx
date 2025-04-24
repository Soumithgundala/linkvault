import { useState, useEffect } from "react";
import LinkPreview from "@/components/LinkPreview";
import Navbar from "@/components/navbar";
import { doc, getDoc } from "firebase/firestore"; // Changed from getDocs
import { db, auth } from "@/firebase"; // Added auth

interface SocialProfile {
  platform: string;
  username: string;
}

interface ProfileData {
  id: string;
  username: string;
  socialProfiles?: SocialProfile[];
  updatedAt?: Date | null;
}

export default function View() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        // Get reference to the current user's document
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            id: docSnap.id,
            username: data.username || "Unknown",
            socialProfiles: data.socialProfiles || [],
            updatedAt: data.updatedAt?.toDate() || null,
          });
        } else {
          setError("Profile not found");
        }
      } catch (err) {
        setError("Failed to fetch profile");
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);
    // Utility function to create profile URLs
    const getProfileUrl = (platform: string, username: string) => {
      switch (platform.toLowerCase()) {
        case "instagram":
          return `https://instagram.com/${username}`;
        case "twitter":
          return `https://twitter.com/${username}`;
        case "github":
          return `https://github.com/${username}`;
        case "linkedin":
          return `https://linkedin.com/in/${username}`;
        case "facebook":
          return `https://facebook.com/${username}`;
        case "tiktok":
          return `https://tiktok.com/@${username}`;
        case "youtube":
          return `https://youtube.com/${username}`;
        case "snapchat":
          return `https://snapchat.com/add/${username}`;
        case "leetcode":
          return `https://leetcode.com/${username}`;
        default:
          return "";
      }
    };

  // ... keep getProfileUrl function the same ...

  return (
    <>
      <Navbar />
      <div className="view-page">
        <h1 className="view-title">{profile?.username||"Your Profile"}</h1>
        {error && <p className="error-message">{error}</p>}
        
        {loading ? (
          <p>Loading...</p>
        ) : profile ? (
          <div className="profiles-grid">
            <div className="profile-card">
              {profile.socialProfiles?.length ? (
                profile.socialProfiles.map((social, index) => (
                  <div key={`${profile.id}-${social.platform}-${index}`} 
                       className="social-profile">
                    <h3>{social.platform}</h3>
                    <div className="link-preview-container">
                      <LinkPreview url={getProfileUrl(social.platform, social.username)} />
                    </div>
                  </div>
                ))
              ) : (
                <p>No social profiles found</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}