// src/pages/profile.tsx
import { useState } from 'react';
import { auth } from '@/firebase';
import { addUserProfile } from '@/lib/db'; 
import Navbar from '@/components/navbar';
import '@/styles/globals.css'; 
import '@/styles/Profile.module.css'; 
interface SocialProfile {
  platform: string;
  username: string;
}

const supportedPlatforms = [
  { name: 'Instagram', baseUrl: 'instagram.com', icon: '📸', placeholder: 'your_username' },
  { name: 'Twitter', baseUrl: 'twitter.com', icon: '🐦', placeholder: 'your_handle' },
  { name: 'LinkedIn', baseUrl: 'linkedin.com/in', icon: '💼', placeholder: 'your-profile' },
  { name: 'GitHub', baseUrl: 'github.com', icon: '🐙', placeholder: 'yourusername' },
  { name: 'Facebook', baseUrl: 'facebook.com', icon: '📘', placeholder: 'your.profile' },
  { name: 'YouTube', baseUrl: 'youtube.com/@', icon: '📺', placeholder: 'yourchannel' },
  { name: 'TikTok', baseUrl: 'tiktok.com/@', icon: '🎵', placeholder: 'yourusername' },
  { name: 'Snapchat', baseUrl: 'snapchat.com/add', icon: '👻', placeholder: 'yourusername' },
];

export default function ProfileManager() {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [username, setUsername] = useState('');
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddProfile = () => {
    if (!selectedPlatform) {
      setError('Please select a platform');
      return;
    }
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    const newProfile = {
      platform: selectedPlatform,
      username: username.trim()
    };

    setProfiles([...profiles, newProfile]);
    setSelectedPlatform('');
    setUsername('');
    setError('');
  };

  const handleRemoveProfile = (index: number) => {
    setProfiles(profiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      
      await addUserProfile(user.uid, profiles);
      alert('Profiles saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profiles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="profile-container">
      <h1>Manage Social Profiles</h1>
      
      <div className="profile-form">
        <div className="input-group">
          <select 
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="platform-select"
          >
            <option value="">Select Platform</option>
            {supportedPlatforms.map((platform) => (
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
              supportedPlatforms.find(p => p.name === selectedPlatform)?.placeholder || 'Username'
            }
            className="username-input"
          />

          <button 
            type="button" 
            onClick={handleAddProfile}
            className="add-button"
          >
            Add Profile
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {profiles.length > 0 && (
          <form onSubmit={handleSubmit} className="profiles-list">
            <h2>Your Profiles</h2>
            
            {profiles.map((profile, index) => (
              <div key={index} className="profile-item">
                <span className="platform-icon">
                  {supportedPlatforms.find(p => p.name === profile.platform)?.icon}
                </span>
                <div className="profile-info">
                  <span className="platform-name">{profile.platform}</span>
                  <a
                    href={`https://${
                      supportedPlatforms.find(p => p.name === profile.platform)?.baseUrl
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
                  onClick={() => handleRemoveProfile(index)}
                  className="remove-button"
                >
                  ×
                </button>
              </div>
            ))}

            <button 
              type="submit" 
              disabled={loading}
              className="save-button"
            >
              {loading ? 'Saving...' : 'Save All Profiles'}
            </button>
          </form>
        )}
      </div>
    </div>
  </>
  );
}