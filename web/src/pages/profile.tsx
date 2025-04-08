// src/pages/profile/[username].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import app  from '@/firebase';
import Head from 'next/head';
import Image from 'next/image';
import Navbar from "@/components/navbar";

interface Profile {
  id: string;
  username: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  website?: string;
}

interface SocialLink {
  id: string;
  url: string;
  profileId: string;
}

interface PlatformConfig {
  name: string;
  urlPattern: string;
  icon: string;
  color: string;
}

const platformPatterns: PlatformConfig[] = [
  {
    name: 'Instagram',
    urlPattern: 'instagram.com/{username}',
    icon: 'ri:instagram-fill',
    color: '#E1306C'
  },
  {
    name: 'Twitter',
    urlPattern: 'x.com/{username}',
    icon: 'ri:twitter-x-fill',
    color: '#000000'
  },
  {
    name: 'LinkedIn',
    urlPattern: 'linkedin.com/in/{username}',
    icon: 'ri:linkedin-fill',
    color: '#0A66C2'
  },
  {
    name: 'GitHub',
    urlPattern: 'github.com/{username}',
    icon: 'ri:github-fill',
    color: '#181717'
  },
  {
    name: 'Facebook',
    urlPattern: 'facebook.com/{username}',
    icon: 'ri:facebook-fill',
    color: '#1877F2'
  }
];

export default function ProfilePage() {
  const router = useRouter();
  const { username } = router.query;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        if (!username) return;

        const db = getFirestore(app);
        const profilesRef = collection(db, 'profiles');
        const q = query(profilesRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('Profile not found');
          return;
        }

        const profileData = querySnapshot.docs[0].data() as Omit<Profile, 'id'>;
        setProfile({
          id: querySnapshot.docs[0].id,
          ...profileData
        });

        const linksRef = collection(db, 'social_links');
        const linksQuery = query(linksRef, where('profileId', '==', querySnapshot.docs[0].id));
        const linksSnapshot = await getDocs(linksQuery);
        
        const linksData = linksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SocialLink[];

        setSocialLinks(linksData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>{profile?.displayName || username} - LinkVault</title>
        <meta name="description" content={profile?.bio || 'LinkVault Profile'} />
        {profile?.photoURL && <meta property="og:image" content={profile.photoURL} />}
      </Head>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center gap-6">
            {profile?.photoURL && (
              <Image
                src={profile.photoURL}
                alt={`${username}'s avatar`}
                width={96}
                height={96}
                className="rounded-full object-cover border-4 border-white shadow-lg"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profile?.displayName || username}
              </h1>
              {profile?.bio && (
                <p className="mt-2 text-gray-600">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {socialLinks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialLinks.map((link) => {
              const platform = platformPatterns.find(p => 
                link.url.includes(p.urlPattern.split('{username}')[0])
              );

              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 flex items-center gap-4"
                  style={{ borderLeft: `4px solid ${platform?.color || '#6B7280'}` }}
                >
                  <span 
                    className="text-2xl" 
                    style={{ color: platform?.color || '#6B7280' }}
                    dangerouslySetInnerHTML={{ __html: platform?.icon || '🌐' }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {platform?.name || 'Website'}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {link.url.split('/').pop()}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {profile?.website && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Website</h2>
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {profile.website}
            </a>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export async function getServerSideProps() {
  return { props: {} };

}