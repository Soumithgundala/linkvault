import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import Navbar from '@/components/navbar';

// Define the structure for the user's links and profile
interface LinkItem {
    id: string;
    url: string;
    title: string;
    platformName: string;
    icon: string;
}

interface UserProfile {
    userDisplayName: string;
    links: LinkItem[];
}

export default function UserProfilePage() {
    const router = useRouter();
    // Get the username from the URL, e.g., "soumithgundala" from /soumithgundala
    const { username } = router.query;

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (username && typeof username === 'string') {
            const fetchUserProfile = async () => {
                setLoading(true);
                setError('');
                try {
                    const usersRef = collection(db, 'users');
                    const q = query(
                        usersRef,
                        where('userDisplayName', '==', username),
                        limit(1)
                    );
                    const querySnapshot = await getDocs(q);

                    if (querySnapshot.empty) {
                        setError(`Profile for "${username}" not found.`);
                        setProfile(null);
                    } else {
                        const userData = querySnapshot.docs[0].data() as UserProfile;
                        setProfile(userData);
                    }
                } catch (err) {
                    console.error("Error fetching user profile:", err);
                    setError('Failed to load user profile.');
                } finally {
                    setLoading(false);
                }
            };

            fetchUserProfile();
        }
    }, [username]);

    return (
        <div className="page-container">
            <Navbar />
            <main className="view-page">
                {loading && <p style={{ textAlign: 'center' }}>Loading profile...</p>}
                
                {error && <p className="error-message">{error}</p>}
                
                {profile && (
                    <>
                        <h1 className="view-title">{profile.userDisplayName}&#39;s Links</h1>
                        <div className="links-container">
                            {profile.links && profile.links.length > 0 ? (
                                profile.links.map(link => (
                                    <a 
                                      key={link.id} 
                                      href={link.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="profile-link-card"
                                    >
                                        <div className="link-card-icon">{link.icon}</div>
                                        <div className="link-card-info">
                                            <span className="link-card-title">{link.title}</span>
                                            <span className="link-card-url">{link.url}</span>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center' }}>This user has not added any links yet.</p>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}