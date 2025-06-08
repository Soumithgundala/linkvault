// src/pages/view.tsx
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { doc, onSnapshot } from "firebase/firestore"; 
import { db, auth } from "@/firebase";
import { v4 as uuidv4 } from 'uuid';

// The structure of one link item from your Firestore database
interface LinkItem {
  id: string;
  url: string;
  title: string;
  platformName: string;
  icon: string;
}

// The structure of your user's profile document
interface ProfileData {
  userDisplayName: string;
  links: LinkItem[];
}

export default function View() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        
        const firestoreUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // This ensures every link has a unique 'id' for React to use,
            // without changing the other data.
            const sanitizedLinks = (data.links || []).map((link: Partial<LinkItem>) => ({
              id: link.id || uuidv4(),
              url: link.url || '#', // Use '#' as a fallback URL
              title: link.title || 'Untitled Link',
              platformName: link.platformName || 'Link',
              icon: link.icon || '🔗',
            }));

            setProfile({
              userDisplayName: data.userDisplayName || "User Profile",
              links: sanitizedLinks as LinkItem[],
            });
            setError("");
          } else {
            setError("Profile not found. Please save your links first.");
            setProfile(null);
          }
          setLoading(false);
        }, (err) => {
          console.error("Error with Firestore listener:", err);
          setError("Failed to listen for profile updates.");
          setLoading(false);
        });

        return () => firestoreUnsubscribe();

      } else {
        setProfile(null);
        setError("Please sign in to view your profile.");
        setLoading(false);
      }
    });

    return () => authUnsubscribe();
  }, []);

  // The rendering logic is now simple and direct
  return (
    <>
      <Navbar />
      <div className="view-page">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : profile ? (
          <>
            <h1 className="view-title">{profile.userDisplayName}</h1>
            <div className="links-container">
              {profile.links.length > 0 ? (
                profile.links.map((link) => (
                  // Each link is rendered as a clickable <a> tag
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-link-card"
                  >
                    {/* We display the icon, title, and URL from your database */}
                    <span className="link-card-icon">{link.icon}</span>
                    <div className="link-card-info">
                      <span className="link-card-title">{link.title}</span>
                      <span className="link-card-url">{link.platformName}</span>
                    </div>
                  </a>
                ))
              ) : (
                <p>No links have been added yet.</p>
              )}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}