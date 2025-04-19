import { useState, useEffect } from "react";
import LinkPreview from "@/components/LinkPreview";
import Navbar from "@/components/navbar";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

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
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        const profilesData: ProfileData[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Firestore data:", data); // Add this for debugging

          profilesData.push({
            id: doc.id,
            username: data.username || "Unknown",
            socialProfiles: data.socialProfiles || [],
            updatedAt: data.updatedAt?.toDate() || null,
          });
        });

        setProfiles(profilesData);
      } catch (err) {
        setError("Failed to fetch profiles.");
        console.error("Error fetching profiles:", err);
      }
    };

    fetchProfiles();
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
  return (
    <>
      <Navbar />
      <div className="view-page">
        <h1 className="view-title">All Profiles</h1>
        {error && <p className="error-message">{error}</p>}
        <div className="profiles-grid">
          {profiles
            .filter(profile => profile.socialProfiles?.length) // Only show profiles with socials
            .map((profile) => (
              <div key={profile.id} className="profile-card">
                {profile.socialProfiles?.map((social, index) => (
                  <div key={`${profile.id}-${social.platform}-${index}`} className="social-profile">
                    <h3>{social.platform}</h3>
                    <div className="link-preview-container">
                      <LinkPreview url={getProfileUrl(social.platform, social.username)} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </>
  );


}