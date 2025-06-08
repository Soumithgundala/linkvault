// src/pages/view.tsx
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { doc, onSnapshot } from "firebase/firestore"; 
import { db, auth } from "@/firebase";
import { v4 as uuidv4 } from 'uuid'; // <-- 1. Import uuid

// ... (interfaces remain the same) ...
interface LinkItem {
  id: string;
  url: string;
  title: string;
  platformName: string;
  icon: string;
}

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
            
            // --- 2. FIX: Ensure all links have a unique ID ---
            const incomingLinks = data.links || [];
            const sanitizedLinks = incomingLinks.map((link: any) =>{
              if (!link || typeof link !== 'object'){
                return {
                  id: uuidv4(), // Create a new ID if link is invalid
                  url: "",
                  title: "Invalid Link",
                  platformName: "Unknown",
                  icon: "⚠️", // Default icon for invalid links
                }
              }
              return {
                id: link.id || uuidv4(), // Use existing ID or create a new one
                url: link.url || "",
                title: link.title || "Untitled Link",
                platformName: link.platformName || "Unknown",
                icon: link.icon || "🔗", // Default icon if none provided
              };
            })

            setProfile({
              userDisplayName: data.userDisplayName || "User Profile",
              links: sanitizedLinks, // Use the sanitized array
            });
            setError("");
          } else {
            // ... (rest of the logic is fine)
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

  // --- 3. THE KEY PROP: Your rendering code was already correct ---
  // The error happened because the DATA was missing the `id`.
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
                  <a
                    key={link.id} // <-- This line needs a valid, non-null link.id to work
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-link-card"
                  >
                    <span className="link-card-icon">{link.icon}</span>
                    <div className="link-card-info">
                      <span className="link-card-title">{link.title}</span>
                      <span className="link-card-url">{link.url}</span>
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