// src/pages/profile.tsx
import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase';
import Navbar from '@/components/navbar';
import { collection, doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

interface SocialProfile {
  platform: string;
  username: string;
}

const socialPlatforms = [
  { name: 'Instagram', baseUrl: 'instagram.com', icon: '📸', placeholder: 'your_username' },
  { name: 'Twitter', baseUrl: 'twitter.com', icon: '🐦', placeholder: 'your_handle' },
  { name: 'LinkedIn', baseUrl: 'linkedin.com/in', icon: '💼', placeholder: 'your-profile' },
  { name: 'GitHub', baseUrl: 'github.com', icon: '🐙', placeholder: 'yourusername' },
  { name: 'Facebook', baseUrl: 'facebook.com', icon: '📘', placeholder: 'your.profile' },
  { name: 'YouTube', baseUrl: 'youtube.com/c', icon: '📺', placeholder: 'YourChannelNameOrID' },
  { name: 'TikTok', baseUrl: 'tiktok.com/@', icon: '🎵', placeholder: 'yourusername' },
  { name: 'Snapchat', baseUrl: 'snapchat.com/add', icon: '👻', placeholder: 'yourusername' },
  { name: 'LeetCode', baseUrl: 'leetcode.com', icon: '💻', placeholder: 'yourusername' },
];

export default function ProfileManager() {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [username, setUsername] = useState('');
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState<string | null>(null); // State for user's name

  console.log('[ProfileManager RENDER] Current profiles:', JSON.stringify(profiles));
  console.log('[ProfileManager RENDER] Current user display name:', currentUserDisplayName);


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfileData = async (userId: string) => {
      setLoading(true);
      try {
        const userRef = doc(db, "users", userId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log('[useEffect] Fetched user data:', JSON.stringify(userData));
          if (userData.socialProfiles && Array.isArray(userData.socialProfiles)) {
            setProfiles(userData.socialProfiles);
            console.log('[useEffect] Profiles set from Firestore:', JSON.stringify(userData.socialProfiles));
          }
        } else {
          console.log("[useEffect] No such document in Firestore for user. Starting with empty profiles.");
          setProfiles([]);
        }
      } catch (err) {
        console.error("[useEffect] Error fetching user profile from Firestore:", err);
        setError("Failed to load existing profiles.");
        setProfiles([]);
      }
      setLoading(false);
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        console.log("[useEffect] User is signed in:", user.uid);
        // Set display name
        setCurrentUserDisplayName(user.displayName || user.email || "User"); // Fallback to email or generic "User"
        fetchUserProfileData(user.uid);
      } else {
        console.log("[useEffect] User is signed out.");
        setProfiles([]);
        setSelectedPlatform('');
        setUsername('');
        setError('');
        setCurrentUserDisplayName(null); // Clear display name on logout
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); 
    setLoading(true);
    setError('');
  
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('User not authenticated. Please sign in.');
        setLoading(false);
        return;
      }
  
      const userRef = doc(collection(db, "users"), user.uid);
      
      console.log('[handleSubmit] Saving profiles to Firestore:', JSON.stringify(profiles));
      await setDoc(userRef, {
        userDisplayName: user.displayName || user.email || "Anonymous", // This is already good
        socialProfiles: profiles,
        updatedAt: serverTimestamp()
      }, { merge: true }); 
  
      alert('Profiles saved successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save profiles';
      setError(errorMessage);
      console.error('[handleSubmit] Error saving profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProfile = () => {
    if (!selectedPlatform) {
      setError('Please select a platform.');
      return;
    }
    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }
    
    const newProfile = { platform: selectedPlatform, username: username.trim() };
    
    console.log('[handleAddProfile] Attempting to add profile:', JSON.stringify(newProfile));
    console.log('[handleAddProfile] Profiles BEFORE adding:', JSON.stringify(profiles));

    setProfiles(prevProfiles => {
      const profileExists = prevProfiles.some(
        p => p.platform === newProfile.platform && p.username === newProfile.username
      );
      if (profileExists) {
        setError(`Profile for ${newProfile.platform} with username ${newProfile.username} already exists.`);
        console.log('[handleAddProfile] Profile already exists. Not adding.');
        return prevProfiles;
      }

      const updatedProfiles = [...prevProfiles, newProfile];
      console.log('[handleAddProfile] Profiles AFTER adding (new state):', JSON.stringify(updatedProfiles));
      return updatedProfiles;
    });
  
    setSelectedPlatform('');
    setUsername('');
    setError(''); 
  };
  
  return (
    <>
      <Navbar />
      <div className="profile-container">
        <h1>Manage Your Public Profiles</h1>
        
        {/* Display Current User's Name */}
        {currentUserDisplayName && (
          <p className="user-greeting" style={{ textAlign: 'center', margin: '0.5rem 0 1.5rem', fontSize: '1.1rem' }}>
            Welcome, {currentUserDisplayName}!
          </p>
        )}

        {auth.currentUser ? ( // You can also use currentUserDisplayName to gate this section
          <>
            <div className="social-section">
              <h2>Add Social Profiles</h2>
              <div className="profile-form">
                <div className="input-group">
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="platform-select"
                    aria-label="Select social media platform"
                  >
                    <option value="">Select Platform</option>
                    {socialPlatforms.map((platform) => (
                      <option key={platform.name} value={platform.name}>
                        {platform.icon} {platform.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      socialPlatforms.find(p => p.name === selectedPlatform)?.placeholder || 'Username or Handle'
                    }
                    className="username-input"
                    aria-label="Username or Handle"
                  />

                  <button
                    type="button"
                    onClick={handleAddProfile}
                    className="add-button"
                    disabled={loading}
                  >
                    Add Profile
                  </button>
                </div>

                {error && <div className="error-message" role="alert">{error}</div>}

                {profiles.length > 0 && (
                  <div className="profiles-list">
                    <h3>Your Added Profiles:</h3>
                    {profiles.map((profile, index) => {
                      const platformInfo = socialPlatforms.find(p => p.name === profile.platform);
                      const profileUrl = platformInfo ? `https://${platformInfo.baseUrl}/${profile.username}` : '#';
                      
                      return (
                        <div key={`${profile.platform}-${profile.username}-${index}`} className="profile-item">
                          <span className="platform-icon" aria-hidden="true">
                            {platformInfo?.icon}
                          </span>
                          <div className="profile-info">
                            <span className="platform-name">{profile.platform}</span>
                            <a
                              href={profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="profile-link"
                            >
                              {profile.username}
                            </a>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              console.log('[Remove Profile] Removing profile at index:', index, 'Profile:', JSON.stringify(profiles[index]));
                              setProfiles(prevProfiles => prevProfiles.filter((_, i) => i !== index));
                            }}
                            className="remove-button"
                            aria-label={`Remove ${profile.platform} profile for ${profile.username}`}
                            disabled={loading}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <div className="save-button-container">
              <button 
                type="button" 
                onClick={() => handleSubmit()}
                disabled={loading || profiles.length === 0}
                className="save-button"
              >
              {loading ? 'Saving...' : 'Save All Profiles to LinkVault'}
            </button>
            </div>
          </>
        ) : (
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>
            Please sign in to manage your profiles.
          </p>
        )}
      </div>
    </>
  );
}