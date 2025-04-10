import { useState, useEffect } from "react";
import LinkPreview from "@/components/LinkPreview";
import Navbar from "@/components/navbar";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import "@/styles/globals.css";

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
            updatedAt: data.updatedAt?.toDate() || null
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
    switch(platform.toLowerCase()) {
      case 'instagram':
        return `https://instagram.com/${username}`;
      case 'twitter':
        return `https://twitter.com/${username}`;
      case 'github':
        return `https://github.com/${username}`;
      default:
        return '';
    }
  };

  return (
    <>
      <Navbar />
      <div className="view-page">
        <h1 className="view-title">All Profiles</h1>
        {error && <p className="error-message">{error}</p>}
        <div className="profiles-grid">
          {profiles.map((profile) => (
            <div key={profile.id} className="profile-card">
              <h2 className="profile-username">{profile.username}</h2>
              {profile.socialProfiles?.length ? (
                profile.socialProfiles.map((social, index) => (
                  <div key={index} className="social-profile">
                    <h3>{social.platform}</h3>
                    <div className="link-preview-container">
                      <LinkPreview url={getProfileUrl(social.platform, social.username)} />
                    </div>
                  </div>
                ))
              ) : (
                <p>No social profiles available</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}