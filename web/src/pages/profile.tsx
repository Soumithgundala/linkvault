// src/pages/profile.tsx
import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase';
import { updateProfile } from "firebase/auth";
import Navbar from '@/components/navbar';
import { collection, doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { PencilSquare, XSquareFill, CheckSquareFill } from 'react-bootstrap-icons';

// --- 1. Unified Data Structure for ALL links ---
interface LinkItem {
  id: string;          // Unique ID for each item
  url: string;         // The final, full URL
  title: string;       // The main display name for ANY link
  platformName: string;// e.g., "GitHub", "Twitter", or a simplified domain name
  icon: string;        // The emoji to display (e.g., '🐙' or '🔗')
}

// Key for the custom URL option
const ADD_OTHER_URL_KEY = 'Add other Url';
const GENERIC_LINK_ICON = '🔗';

// --- 2. Updated list of platforms including the "Add other Url" option ---
const socialPlatforms = [
  { name: 'Instagram', domainMatch: 'instagram.com', baseUrl: 'https://instagram.com', icon: '📸', placeholder: 'your_username' },
  { name: 'Twitter', domainMatch: 'twitter.com', baseUrl: 'https://twitter.com', icon: '🐦', placeholder: 'your_handle' },
  { name: 'X', domainMatch: 'x.com', baseUrl: 'https://x.com', icon: '🐦', placeholder: 'your_handle' },
  { name: 'LinkedIn', domainMatch: 'linkedin.com', baseUrl: 'https://linkedin.com/in', icon: '💼', placeholder: 'your-profile-id' },
  { name: 'GitHub', domainMatch: 'github.com', baseUrl: 'https://github.com', icon: '🐙', placeholder: 'yourusername' },
  { name: 'Facebook', domainMatch: 'facebook.com', baseUrl: 'https://facebook.com', icon: '📘', placeholder: 'your.profile' },
  { name: 'YouTube', domainMatch: 'youtube.com', baseUrl: 'https://youtube.com', icon: '📺', placeholder: 'ChannelNameOrID' },
  { name: 'TikTok', domainMatch: 'tiktok.com', baseUrl: 'https://tiktok.com/@', icon: '🎵', placeholder: 'yourusername' },
  { name: 'Snapchat', domainMatch: 'snapchat.com', baseUrl: 'https://snapchat.com/add', icon: '👻', placeholder: 'yourusername' },
  { name: 'LeetCode', domainMatch: 'leetcode.com', baseUrl: 'https://leetcode.com', icon: '💻', placeholder: 'yourusername' },
  // The special option for adding any other URL
  { name: ADD_OTHER_URL_KEY, icon: '+', placeholder: 'enter your complete url' }, 
];

export default function ProfileManager() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  
  // --- 3. Separate states for different input types ---
  const [username, setUsername] = useState('');      // For known platforms (GitHub, etc.)
  const [directUrl, setDirectUrl] = useState('');    // For custom URL input
  const [customTitle, setCustomTitle] = useState('');// For custom URL's title
  
  // States for display name editing
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState<string | null>(null);
  const [editableDisplayName, setEditableDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // General loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetches and migrates user data on login
  useEffect(() => {
    const fetchUserProfileData = async (userId: string, user: import("firebase/auth").User) => {
      setLoading(true);
      setError(null);
      try {
        const userRef = doc(db, "users", userId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          // Check for both old ('socialProfiles') and new ('links') field names
          const dataToProcess = userData.links || userData.socialProfiles; 

          if (Array.isArray(dataToProcess)) {
            // FIX FOR BLANK PREVIEWS: Convert old data to the new unified format
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cleanLinks = dataToProcess.map((item: any) => {
              // If it's the OLD format (has 'platform' but not 'title')
              if( !item || typeof item !='object'){
                return null;
              }
              if (item.platform && item.username) {
                const platformInfo = socialPlatforms.find(p => p.name === item.platform);
                if (!platformInfo) return null;
                return {
                  id: uuidv4(),
                  url: platformInfo ? `${platformInfo.baseUrl}/${item.username}` : '#',
                  title: `${item.platform}: ${item.username}`, // Create a default title
                  platformName: item.platform,
                  icon: platformInfo ? platformInfo.icon : GENERIC_LINK_ICON,
                };
              }

              if(item.url &&item.title){
                const platformInfo = socialPlatforms.find(p => p.domainMatch && item.url.includes(p.domainMatch));
                return {
                  id: item.id || uuidv4(), // Ensure it has an ID
                  url: item.url,
                  title: item.title,
                  platformName: platformInfo ? platformInfo.name : item.platformName || item.url.replace(/^https?:\/\//, '').split('/')[0],
                  icon: platformInfo ? platformInfo.icon : GENERIC_LINK_ICON,
                };
              }
              return null;
            }).filter(Boolean); // Remove any null entries
            setLinks(cleanLinks as LinkItem[]);
          }
        }
      } catch (err) {
        console.error("Error fetching/migrating profiles:", err);
        setError("Failed to load your saved links.");
      } finally {
        setLoading(false);
      }
      
      // Set display name states
      const displayName = user.displayName || user.email || "User";
      setCurrentUserDisplayName(displayName);
      setEditableDisplayName(user.displayName || '');
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchUserProfileData(user.uid, user);
      } else {
        // Clear all state on logout
        setLinks([]); setSelectedPlatform(''); setUsername(''); setDirectUrl(''); setCustomTitle('');
        setError(null); setCurrentUserDisplayName(null); setEditableDisplayName('');
      }
    });
    return () => unsubscribe();
  }, []);
  
  // Handles updating the user's display name
  const handleUpdateDisplayName = async () => {
    if (!editableDisplayName.trim()) { setError("Display name cannot be empty."); return; }
    if (!auth.currentUser) { setError("You must be logged in."); return; }
    
    setIsUpdatingName(true);
    setError(null);
    try {
      await updateProfile(auth.currentUser, { displayName: editableDisplayName.trim() });
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, { userDisplayName: editableDisplayName.trim() }, { merge: true });
      
      setCurrentUserDisplayName(editableDisplayName.trim());
      setIsEditingName(false);
      setSuccessMessage("Display name updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000); // Clear message after 3 seconds
    } catch { 
      setError("Failed to update display name."); 
    } finally { 
      setIsUpdatingName(false); 
    }
  };

  // --- 4. The combined "Add Link" handler ---
  const handleAddLink = () => {
    setError(null);
    if (!selectedPlatform) {
      setError('Please select a platform or an option.');
      return;
    }

    let newLink: LinkItem | null = null;

    if (selectedPlatform === ADD_OTHER_URL_KEY) {
      // Logic for "Add other Url"
      if (!directUrl.trim()) { setError('Please enter a URL.'); return; }
      if (!customTitle.trim()) { setError('Please provide a title for your link.'); return; }
      
      let parsedUrl;
      try {
        parsedUrl = new URL(directUrl.trim());
      } catch {
        setError('The URL you entered is not valid.'); return;
      }

      // Automatically detect icon if the URL matches a known platform
      const detectedPlatform = socialPlatforms.find(p => p.domainMatch && parsedUrl.hostname.includes(p.domainMatch));
      
      newLink = {
        id: uuidv4(),
        url: directUrl.trim(),
        title: customTitle.trim(),
        platformName: detectedPlatform ? detectedPlatform.name : parsedUrl.hostname.replace(/^www\./, ''),
        icon: detectedPlatform ? detectedPlatform.icon : GENERIC_LINK_ICON,
      };

      // Clear the specific inputs for this method
      setDirectUrl('');
      setCustomTitle('');
    } else {
      // Logic for known platforms (GitHub, Twitter, etc.)
      if (!username.trim()) { setError('Please enter your username or ID.'); return; }
      const platformInfo = socialPlatforms.find(p => p.name === selectedPlatform);
      if (!platformInfo) { setError('Invalid platform selected.'); return; }

      newLink = {
        id: uuidv4(),
        url: platformInfo.baseUrl ? `${platformInfo.baseUrl}/${username.trim()}`: username.trim(),
        title: `${platformInfo.name}: ${username.trim()}`, // Default title
        platformName: platformInfo.name,
        icon: platformInfo.icon,
      };

      // Clear the username input
      setUsername('');
    }

    // Add the new link if it's not a duplicate
    if (newLink) {
      if (links.some(link => link.url === newLink!.url)) {
        setError('This link has already been added.');
        return;
      }
      setLinks(prevLinks => [...prevLinks, newLink!]);
    }
    
    // Reset the dropdown after adding
    setSelectedPlatform('');
  };

  const handleRemoveLink = (idToRemove: string) => {
    setLinks(prevLinks => prevLinks.filter(link => link.id !== idToRemove));
  };
  
  // Saves the final list of links to Firestore
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated.');

      const userRef = doc(collection(db, "users"), user.uid);
      await setDoc(userRef, { 
        links: links, 
        socialProfiles: links, // Save to both for full compatibility
        updatedAt: serverTimestamp()
      }, { merge: true });

      setSuccessMessage('Your links have been saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000); // Clear message after 3 seconds
      
    } catch (error) { 
      setError(error instanceof Error ? error.message : 'Failed to save links'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        {/* <h1>Manage Your Public Profiles</h1> */}
        
        {/* --- Inline Username Edit Section --- */}
        {auth.currentUser && (
            <div className="welcome-and-edit-container">
            {!isEditingName ? (
                <div className="user-greeting-display">
                <p className="user-greeting">Welcome, {currentUserDisplayName}!</p>
                <button onClick={() => setIsEditingName(true)} className="inline-edit-button edit" aria-label="Edit display name">
                    <PencilSquare size={18} />
                </button>
                </div>
            ) : (
                <div className="inline-edit-form">
                <input type="text" value={editableDisplayName} onChange={(e) => setEditableDisplayName(e.target.value)} className="username-input-inline" autoFocus />
                <button onClick={handleUpdateDisplayName} className="inline-edit-button save" disabled={isUpdatingName || !editableDisplayName || editableDisplayName === currentUserDisplayName}>
                    {isUpdatingName ? '...' : <CheckSquareFill size={20} />}
                </button>
                <button onClick={() => setIsEditingName(false)} className="inline-edit-button cancel"><XSquareFill size={20} /></button>
                </div>
            )}
            </div>
        )}
        
        {auth.currentUser ? (
          <>
            <div className="social-section">
              <div className="profile-form">
                <div className="input-group">
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="platform-select"
                  >
                    <option value="">Select Platform...</option>
                    {socialPlatforms.map((platform) => (
                      <option key={platform.name} value={platform.name}>
                        {platform.icon} {platform.name}
                      </option>
                    ))}
                  </select>

                  {/* --- 5. CONDITIONAL INPUTS for a better User Experience --- */}
                  {/* Show username input for known platforms */}
                  {selectedPlatform && selectedPlatform !== ADD_OTHER_URL_KEY && (
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={socialPlatforms.find(p => p.name === selectedPlatform)?.placeholder || 'Username or ID'}
                      className="username-input"
                    />
                  )}

                  {/* Show URL and Title inputs for "Add other Url" */}
                  {selectedPlatform === ADD_OTHER_URL_KEY && (
                    <>
                      <input
                        type="url"
                        value={directUrl}
                        onChange={(e) => setDirectUrl(e.target.value)}
                        placeholder="Enter full URL (e.g., https://...)"
                        className="username-input"
                      />
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Enter a title for this link"
                        className="username-input"
                      />
                    </>
                  )}

                  <button type="button" onClick={handleAddLink} className="add-button" disabled={loading || !selectedPlatform}>
                    Add
                  </button>
                </div>
                {error && <div className="error-message" role="alert">{error}</div>}
                {successMessage && <div className="success-message" role="status">{successMessage}</div>}
              </div>
            </div>
            
            {/* --- 6. The Profile Preview list --- */}
            {links.length > 0 && (
              <div className="profiles-list-container">
                <h2>Your Added Links</h2>
                <div className="profiles-list">
                  {links.map((link) => (
                    <div key={link.id} className="profile-item">
                      <span className="platform-icon">{link.icon}</span>
                      <div className="profile-info">
                        <span className="link-title">{link.title}</span> {/* Shows the full title */}
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="profile-link" title={link.url}>
                          {link.platformName} {/* Shows the platform/domain */}
                        </a>
                      </div>
                      <button type="button" onClick={() => handleRemoveLink(link.id)} className="remove-button" disabled={loading}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p style={{ textAlign: 'center', marginTop: '2rem' }}>Please sign in to manage your profiles.</p>
        )}
      </div>

      {/* --- Save Button outside the main container for proper layout --- */}
      {auth.currentUser && links.length > 0 && (
        <div className="save-button-container">
          <button type="button" onClick={handleSubmit} disabled={loading} className="save-button">
            {loading ? 'Saving...' : 'Save All Links'}
          </button>
        </div>
      )}
    </>
  );
}