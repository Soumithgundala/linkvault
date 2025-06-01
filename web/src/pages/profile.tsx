// src/pages/profile.tsx
import { useState, useEffect } from 'react'; // Added useEffect in case you need it later
import { auth, db } from '@/firebase';
// import { GithubAuthProvider, signInWithPopup } from 'firebase/auth'; // Uncomment if you use GitHub sign-in
import Navbar from '@/components/navbar';
// import GitHubStats from '@/components/GitHubHeatmap'; // Uncomment if you use these components
// import LeetCodeStats from '@/components/LeetCodeStats'; // Uncomment if you use these components
import { collection, doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore"; // Added getDoc

interface SocialProfile {
  platform: string;
  username: string;
}

// interface CodingProfile { // Uncomment if you implement coding profiles
//   githubUsername: string;
//   leetcodeUsername: string;
//   // ... other fields
// }

const socialPlatforms = [
  { name: 'Instagram', baseUrl: 'instagram.com', icon: '📸', placeholder: 'your_username' },
  { name: 'Twitter', baseUrl: 'twitter.com', icon: '🐦', placeholder: 'your_handle' },
  { name: 'LinkedIn', baseUrl: 'linkedin.com/in', icon: '💼', placeholder: 'your-profile' },
  { name: 'GitHub', baseUrl: 'github.com', icon: '🐙', placeholder: 'yourusername' },
  { name: 'Facebook', baseUrl: 'facebook.com', icon: '📘', placeholder: 'your.profile' },
  { name: 'YouTube', baseUrl: 'youtube.com/c', icon: '📺', placeholder: 'YourChannelNameOrID' }, // Updated YouTube base URL
  { name: 'TikTok', baseUrl: 'tiktok.com/@', icon: '🎵', placeholder: 'yourusername' },
  { name: 'Snapchat', baseUrl: 'snapchat.com/add', icon: '👻', placeholder: 'yourusername' },
  { name: 'LeetCode', baseUrl: 'leetcode.com', icon: '💻', placeholder: 'yourusername' },
];

export default function ProfileManager() {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [username, setUsername] = useState('');
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  
  // --- DEBUG LOG 1: Log profiles on every render ---
  console.log('[ProfileManager RENDER] Current profiles:', JSON.stringify(profiles));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch existing profiles when the component mounts and user is available
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (auth.currentUser) {
        setLoading(true);
        try {
          const userRef = doc(db, "users", auth.currentUser.uid);
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
            setProfiles([]); // Ensure profiles are empty if no document exists
          }
        } catch (err) {
          console.error("[useEffect] Error fetching user profile from Firestore:", err);
          setError("Failed to load existing profiles.");
          setProfiles([]); // Ensure profiles are empty on error
        }
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        console.log("[useEffect] User is signed in, attempting to fetch profile.");
        fetchUserProfile();
      } else {
        console.log("[useEffect] User is signed out, clearing profiles.");
        setProfiles([]); // Clear profiles if user signs out
        setSelectedPlatform('');
        setUsername('');
        setError('');
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []); // Empty dependency array: runs once on mount and cleanup on unmount after auth state is checked

  const handleSubmit = async (e?: React.FormEvent) => { // Made event optional
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
        userDisplayName: user.displayName || user.email || "Anonymous",
        socialProfiles: profiles, // Save the current 'profiles' state
        updatedAt: serverTimestamp()
      }, { merge: true }); // Use merge: true to update existing doc or create if not exists
  
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
      // Check if profile already exists to prevent duplicates (optional, but good practice)
      const profileExists = prevProfiles.some(
        p => p.platform === newProfile.platform && p.username === newProfile.username
      );
      if (profileExists) {
        setError(`Profile for ${newProfile.platform} with username ${newProfile.username} already exists.`);
        console.log('[handleAddProfile] Profile already exists. Not adding.');
        return prevProfiles; // Return previous state if duplicate
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

        {auth.currentUser ? (
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
                onClick={() => handleSubmit()} // Call directly
                disabled={loading || profiles.length === 0} // Disable if no profiles to save
                className="save-button"
              >
              {loading ? 'Saving...' : 'Save All Profiles to LinkVault'}
            </button>
            </div>
          </>
        ) : (
          <p>Please sign in to manage your profiles.</p>
        )}
      </div>
    </>
  );
}