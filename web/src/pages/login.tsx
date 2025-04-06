// src/pages/login.tsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from 'next/navigation'; // Import useRouter

// Define the profile data interface
interface ProfileData {
  id: string;
  username: string;
  socialLinks: {
    instagram: string;
    twitter: string;
  };
}

// Define an interface for Firebase errors
interface FirebaseErrorType {
  code: string;
  message: string;
}

// Type guard to check if an error is a FirebaseErrorType
function isFirebaseError(error: unknown): error is FirebaseErrorType {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as any).code === "string" &&
    "message" in error &&
    typeof (error as any).message === "string"
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [profile, setProfile] = useState<ProfileData | null>(null);
    const router = useRouter(); // Initialize useRouter

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoggedIn(true);
      setSuccessMessage("Login successful!");
      setErrorMessage("");
      router.push('/profile'); // Redirect to profile page after login
    } catch (error: unknown) {
      if (isFirebaseError(error)) {
        if (error.code === "auth/user-not-found") {
          setErrorMessage("User not found. Please check your email or sign up.");
        } else if (error.code === "auth/wrong-password") {
          setErrorMessage("Incorrect password. Please try again.");
        } else {
          console.error("Error logging in:", error);
          setErrorMessage("An error occurred during login. Please try again.");
        }
      } else {
        console.error("Unexpected error logging in:", error);
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleSearch = async () => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", searchTerm.toLowerCase()));
    const querySnapshot = await getDocs(q);
    let userData: ProfileData | null = null;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      userData = {
        id: doc.id,
        username: data.username,
        socialLinks: data.socialLinks,
      } as ProfileData;
    });
    setProfile(userData);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="max-w-md mx-auto p-6 bg-white rounded shadow-lg mt-10">
        {!isLoggedIn ? (
          <>
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Login</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition duration-300"
              >
                Login
              </button>
            </form>
            {errorMessage && <p className="mt-4 text-red-500 text-center">{errorMessage}</p>}
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-center mb-4 text-green-600">{successMessage}</h1>
            <div className="mt-6">
              <input
                type="text"
                placeholder="Search by username"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                onClick={handleSearch}
                className="w-full bg-green-600 text-white p-3 rounded mt-2 hover:bg-green-700 transition duration-300"
              >
                Search Profile
              </button>
            </div>
            {profile && (
              <div className="mt-6 border p-4 rounded shadow-md">
                <h2 className="font-bold text-xl capitalize text-gray-800">
                  {profile.username}
                </h2>
                <p>
                  Instagram:{" "}
                  <a
                    href={profile.socialLinks?.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 transition duration-300"
                  >
                    {profile.socialLinks?.instagram}
                  </a>
                </p>
                <p>
                  Twitter:{" "}
                  <a
                    href={profile.socialLinks?.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 transition duration-300"
                  >
                    {profile.socialLinks?.twitter}
                  </a>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
