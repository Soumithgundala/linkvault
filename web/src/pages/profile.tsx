// src/pages/profile.tsx
import { useState } from 'react';
import { auth, db } from '@/firebase';
// import { GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import Navbar from '@/components/navbar';
// import GitHubStats from '@/components/GitHubHeatmap';
// import LeetCodeStats from '@/components/LeetCodeStats';
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

interface SocialProfile {
  platform: string;
  username: string;
}

// interface CodingProfile {
//   githubUsername: string;
//   leetcodeUsername: string;
//   githubData?: {
//     commits: number;
//     stars: number;
//     repos: string[];
//   };
//   leetcodeData?: {
//     solved: number;
//     streak: number;
//   };
// }

const socialPlatforms = [
  { name: 'Instagram', baseUrl: 'instagram.com', icon: '📸', placeholder: 'your_username' },
  { name: 'Twitter', baseUrl: 'twitter.com', icon: '🐦', placeholder: 'your_handle' },
  { name: 'LinkedIn', baseUrl: 'linkedin.com/in', icon: '💼', placeholder: 'your-profile' },
  { name: 'GitHub', baseUrl: 'github.com', icon: '🐙', placeholder: 'yourusername' },
  { name: 'Facebook', baseUrl: 'facebook.com', icon: '📘', placeholder: 'your.profile' },
  { name: 'YouTube', baseUrl: 'youtube.com/@', icon: '📺', placeholder: 'yourchannel' },
  { name: 'TikTok', baseUrl: 'tiktok.com/@', icon: '🎵', placeholder: 'yourusername' },
  { name: 'Snapchat', baseUrl: 'snapchat.com/add', icon: '👻', placeholder: 'yourusername' },
  { name: 'leetcode', baseUrl: 'leetcode.com', icon: '💻', placeholder: 'yourusername' },
];

export default function ProfileManager() {
  // Social profiles state
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [username, setUsername] = useState('');
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  
  // // Coding profiles state
  // const [codingProfile, setCodingProfile] = useState<CodingProfile>({
  //   githubUsername: '',
  //   leetcodeUsername: ''
  // });
  
  // Common state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // // GitHub OAuth integration
  // const connectGitHub = async () => {
  //   try {
  //     const provider = new GithubAuthProvider();
  //     const result = await signInWithPopup(auth, provider);
  //     const user = result.user;
      
  //     setCodingProfile(prev => ({
  //       ...prev,
  //       githubUsername: user.providerData[0]?.uid || ''
  //     }));
  //   } catch {
  //     setError('Failed to connect GitHub account');
  //   }
  // };

  // // Fetch LeetCode stats
  // const fetchLeetCodeStats = async () => {
  //   try {
  //     const response = await fetch(`/api/leetcode?username=${codingProfile.leetcodeUsername}`);
  //     const data = await response.json();
  //     setCodingProfile(prev => ({
  //       ...prev,
  //       leetcodeData: data.stats
  //     }));
  //   } catch {
  //     setError('Failed to load LeetCode stats');
  //   }
  // };

  // Save all profiles
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
  
      // Create a user document reference
      const userRef = doc(collection(db, "users"), user.uid);
      
      // Set the document data
      await setDoc(userRef, {
        username: user.displayName || "Anonymous",
        socialProfiles: profiles,
        updatedAt: serverTimestamp()
      });
  
      alert('Profiles saved successfully!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save profiles');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <h1>Manage Profiles</h1>

        {/* Social Profiles Section */}
        <div className="social-section">
          <h2>Social Profiles</h2>
          <div className="profile-form">
            <div className="input-group">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="platform-select"
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
                  socialPlatforms.find(p => p.name === selectedPlatform)?.placeholder || 'Username'
                }
                className="username-input"
              />

              <button
                type="button"
                onClick={() => {
                  if (!selectedPlatform) {
                    setError('Please select a platform');
                    return;
                  }
                  if (!username.trim()) {
                    setError('Please enter a username');
                    return;
                  }
                  setProfiles([...profiles, { platform: selectedPlatform, username }]);
                  setSelectedPlatform('');
                  setUsername('');
                  setError('');
                }}
                className="add-button"
              >
                Add Profile
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {profiles.length > 0 && (
              <div className="profiles-list">
                <h3>Added Profiles</h3>
                {profiles.map((profile, index) => (
                  <div key={index} className="profile-item">
                    <span className="platform-icon">
                      {socialPlatforms.find(p => p.name === profile.platform)?.icon}
                    </span>
                    <div className="profile-info">
                      <span className="platform-name">{profile.platform}</span>
                      <a
                        href={`https://${
                          socialPlatforms.find(p => p.name === profile.platform)?.baseUrl
                        }/${profile.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="profile-link"
                      >
                        {profile.username}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfiles(profiles.filter((_, i) => i !== index))}
                      className="remove-button"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
        <div className="save-button-container">
          <button 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading}
            className="save-button"
          >
          {loading ? 'Saving...' : 'Save All Profiles'}
        </button>
        </div>
    </>
  );
}