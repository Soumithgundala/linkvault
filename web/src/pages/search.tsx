import { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
// import "@/styles/globals.css"; 

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  interface Profile {
    id: string;
    username: string;
    socialLinks: {
      instagram: string;
      twitter: string;
    };
  }

  const [profile, setProfile] = useState<Profile | null>(null);

  
  const handleSearch = async () => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", searchTerm.toLowerCase()));
    const querySnapshot = await getDocs(q);
    let userData = null;
    querySnapshot.forEach((doc) => {
      userData = { id: doc.id, ...doc.data() };
    });
    setProfile(userData);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <input
        type="text"
        placeholder="Search by username"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 w-full"
      />
      <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 mt-2">Search</button>
      {profile && (
        <div className="mt-4 border p-4 rounded">
          <h2 className="font-bold text-xl">{profile.username}</h2>
          <p>Instagram: <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer">{profile.socialLinks.instagram}</a></p>
          <p>Twitter: <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer">{profile.socialLinks.twitter}</a></p>
          {/* Optionally, for each link, you could integrate the Link Preview component here */}
        </div>
      )}
    </div>
  );
}
