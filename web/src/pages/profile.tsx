import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase';
import { updateProfile } from "firebase/auth";
import Navbar from '@/components/navbar';
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { PencilSquare, XSquareFill, CheckSquareFill } from 'react-bootstrap-icons';

// Imports for Drag-and-Drop functionality
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, TouchSensor, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Interfaces and Constants ---
interface LinkItem { id: string; url: string; title: string; platformName: string; icon: string; }
interface OldSocialProfile { platform: string; username: string; }
const ADD_OTHER_URL_KEY = 'Add other Url';
const GENERIC_LINK_ICON = '🔗';
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
    { name: ADD_OTHER_URL_KEY, icon: '+', placeholder: 'enter your complete url' },
];

// A component for a single sortable link item
function SortableLinkItem({ link, handleRemoveLink, isActive }: { link: LinkItem, handleRemoveLink: (e: React.MouseEvent, id: string) => void, isActive: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: link.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    const itemClassName = isActive ? 'profile-item active' : 'profile-item';

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={itemClassName}>
            <div className='drag-handle' {...attributes} {...listeners}>
                <svg xmlns ="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-grip-vertical" viewBox="0 0 16 16">
                    <path d="M2.5 1a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-1 0v-13a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-1 0v-13a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-1 0v-13a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-1 0v-13a.5.5 0 0 1 .5-.5z"/>
                </svg>
            </div>
            {/* <span className="drag-icon">☰</span> */}
            <span className="platform-icon">{link.icon}</span>
            <div className="profile-info">
                <span className="link-title">{link.title}</span>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="profile-link" title={link.url} onClick={(e) => e.stopPropagation()}>
                    {link.platformName}
                </a>
            </div>
            <button type="button" onClick={(e) =>  handleRemoveLink(e, link.id)} className="remove-button">×</button>
        </div>
    );
}

export default function ProfileManager() {
    // --- State Definitions ---
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState('');
    const [username, setUsername] = useState('');
    const [directUrl, setDirectUrl] = useState('');
    const [customTitle, setCustomTitle] = useState('');
    const [currentUserDisplayName, setCurrentUserDisplayName] = useState<string | null>(null);
    const [editableDisplayName, setEditableDisplayName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [isUpdatingName, setIsUpdatingName] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ✅ **THE FIX:** The `useSensors` hook is now at the top level of the component.
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 250, tolerance: 5 },
        })
    );

    // --- Component Logic and Handlers ---

    useEffect(() => {
        const fetchUserProfileData = async (userId: string, user: import("firebase/auth").User) => {
            setLoading(true);
            setError(null);
            try {
                const userRef = doc(db, "users", userId);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    const dataToProcess = userData.links || userData.socialProfiles;
                    if (Array.isArray(dataToProcess)) {
                        const cleanLinks = dataToProcess.map((item: OldSocialProfile | LinkItem) => {
                            if (!item || typeof item !== 'object') return null;
                            if ('platform' in item && 'username' in item) {
                                const platformInfo = socialPlatforms.find(p => p.name === item.platform);
                                if (!platformInfo) return null;
                                return { id: uuidv4(), url: platformInfo.baseUrl ? `${platformInfo.baseUrl}/${item.username}` : '#', title: `${item.platform}: ${item.username}`, platformName: item.platform, icon: platformInfo.icon };
                            }
                            if ('url' in item && 'title' in item) {
                                const platformInfo = socialPlatforms.find(p => p.domainMatch && item.url.includes(p.domainMatch));
                                return { id: ('id' in item && item.id) || uuidv4(), url: item.url, title: item.title, platformName: ('platformName' in item && item.platformName) || item.url.replace(/^https?:\/\//, '').split('/')[0], icon: platformInfo ? platformInfo.icon : GENERIC_LINK_ICON };
                            }
                            return null;
                        }).filter(Boolean);
                        setLinks(cleanLinks as LinkItem[]);
                    }
                }
            } catch (err) {
                console.error("Error fetching profiles:", err);
                setError("Failed to load your saved links.");
            } finally {
                setLoading(false);
            }
            const displayName = user.displayName || user.email || "User";
            setCurrentUserDisplayName(displayName);
            setEditableDisplayName(user.displayName || '');
        };
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                fetchUserProfileData(user.uid, user);
            } else {
                setLinks([]); setSelectedPlatform(''); setUsername(''); setDirectUrl(''); setCustomTitle('');
                setError(null); setCurrentUserDisplayName(null); setEditableDisplayName('');
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };


    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setLinks((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

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
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch {
            setError("Failed to update display name.");
        } finally {
            setIsUpdatingName(false);
        }
    };

    const handleAddLink = () => {
        setError(null);
        if (!selectedPlatform) {
            setError('Please select a platform or an option.');
            return;
        }
        let newLink: LinkItem | null = null;
        if (selectedPlatform === ADD_OTHER_URL_KEY) {
            if (!directUrl.trim()) { setError('Please enter a URL.'); return; }
            if (!customTitle.trim()) { setError('Please provide a title for your link.'); return; }
            let parsedUrl;
            try {
                parsedUrl = new URL(directUrl.trim());
            } catch {
                setError('The URL you entered is not valid.'); return;
            }
            const detectedPlatform = socialPlatforms.find(p => p.domainMatch && parsedUrl.hostname.includes(p.domainMatch));
            newLink = { id: uuidv4(), url: directUrl.trim(), title: customTitle.trim(), platformName: detectedPlatform ? detectedPlatform.name : parsedUrl.hostname.replace(/^www\./, ''), icon: detectedPlatform ? detectedPlatform.icon : GENERIC_LINK_ICON };
            setDirectUrl('');
            setCustomTitle('');
        } else {
            if (!username.trim()) { setError('Please enter your username or ID.'); return; }
            const platformInfo = socialPlatforms.find(p => p.name === selectedPlatform);
            if (!platformInfo) { setError('Invalid platform selected.'); return; }
            newLink = { id: uuidv4(), url: platformInfo.baseUrl ? `${platformInfo.baseUrl}/${username.trim()}` : username.trim(), title: `${platformInfo.name}: ${username.trim()}`, platformName: platformInfo.name, icon: platformInfo.icon };
            setUsername('');
        }
        if (newLink) {
            if (links.some(link => link.url === newLink!.url)) {
                setError('This link has already been added.');
                return;
            }
            setLinks(prevLinks => [...prevLinks, newLink!]);
        }
        setSelectedPlatform('');
    };

    const handleRemoveLink = (e: React.MouseEvent, idToRemove: string) => {
        e.stopPropagation();
        setLinks(prevLinks => prevLinks.filter(link => link.id !== idToRemove));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated.');
            const searchTerms = new Set<string>();
            const addPrefixes = (term: string) => {
                for (let i = 1; i <= term.length; i++) {
                    searchTerms.add(term.substring(0, i));
                }
            };
            if (user.displayName) {
                const lowerCaseName = user.displayName.toLowerCase();
                addPrefixes(lowerCaseName);
            }
            links.forEach(link => {
                if (link.title && link.title.includes(':')) {
                    const username = link.title.split(':')[1]?.trim().toLowerCase();
                    if (username) {
                        addPrefixes(username);
                    }
                }
            });
            const searchableUsernames = Array.from(searchTerms);
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, { userDisplayName: user.displayName, links: links, socialProfiles: links, searchableUsernames: searchableUsernames, updatedAt: serverTimestamp() }, { merge: true });
            setSuccessMessage('Your links have been saved successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to save links');
        } finally {
            setLoading(false);
        }
    };
    // --- JSX to render the page ---
    return (
        <>
            <Navbar />
            <div className="profile-container">
                {loading ? <p style={{textAlign: 'center'}}>Loading...</p> : auth.currentUser ? (
                    <>
                        <div className="welcome-and-edit-container">
                            {!isEditingName ? (
                                <div className="user-greeting-display">
                                    <p className="user-greeting">Welcome, {currentUserDisplayName}!</p>
                                    <button onClick={() => setIsEditingName(true)} className="inline-edit-button edit" aria-label="Edit display name"><PencilSquare size={18} /></button>
                                </div>
                            ) : (
                                <div className="inline-edit-form">
                                    <input type="text" value={editableDisplayName} onChange={(e) => setEditableDisplayName(e.target.value)} className="username-input-inline" autoFocus />
                                    <button onClick={handleUpdateDisplayName} className="inline-edit-button save" disabled={isUpdatingName || !editableDisplayName || editableDisplayName === currentUserDisplayName}>{isUpdatingName ? '...' : <CheckSquareFill size={20} />}</button>
                                    <button onClick={() => setIsEditingName(false)} className="inline-edit-button cancel"><XSquareFill size={20} /></button>
                                </div>
                            )}
                        </div>

                        <div className="social-section">
                            <div className="profile-form">
                                <div className="input-group">
                                    <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} className="platform-select">
                                        <option value="" className='profile-Select-Dropdown'>Select Platform...</option>
                                        {socialPlatforms.map((platform) => (<option key={platform.name} value={platform.name}>{platform.icon} {platform.name}</option>))}
                                    </select>
                                    {selectedPlatform && selectedPlatform !== ADD_OTHER_URL_KEY && (
                                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={socialPlatforms.find(p => p.name === selectedPlatform)?.placeholder || 'Username or ID'} className="username-input" />
                                    )}
                                    {selectedPlatform === ADD_OTHER_URL_KEY && (
                                        <>
                                            <input type="url" value={directUrl} onChange={(e) => setDirectUrl(e.target.value)} placeholder="Enter full URL (e.g., https://...)" className="username-input" />
                                            <input type="text" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Enter a title for this link" className="username-input" />
                                        </>
                                    )}
                                    <button type="button" onClick={handleAddLink} className="add-button" disabled={loading || !selectedPlatform}>Add</button>
                                </div>
                                {error && <div className="error-message" role="alert">{error}</div>}
                                {successMessage && <div className="success-message" role="status">{successMessage}</div>}
                            </div>
                        </div>
                        
                        {links.length > 0 && (
                            <div className="profiles-list-container">
                                <h2>Your Added Links (Drag to Reorder)</h2>
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                                    <SortableContext items={links} strategy={verticalListSortingStrategy}>
                                        <div className="profiles-list">
                                            {links.map(link => (
                                                <SortableLinkItem 
                                                    key={link.id} 
                                                    link={link} 
                                                    handleRemoveLink={handleRemoveLink} 
                                                    isActive={link.id === activeId}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </div>
                        )}
                    </>
                ) : (
                    <p style={{ textAlign: 'center', marginTop: '2rem' }}>Please sign in to manage your profiles.</p>
                )}
            </div>

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