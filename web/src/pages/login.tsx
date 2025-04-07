// src/pages/login.tsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import "@/styles/account.css"; 

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
    typeof (error as FirebaseErrorType).code === "string" &&
    "message" in error &&
    typeof (error as FirebaseErrorType).message === "string"
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
      router.push("/profile"); // Redirect to profile page after login
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
    <div className="login-page">
      <div className="login-card">
        {!isLoggedIn ? (
          <>
            <h1 className="login-title">Login</h1>
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="login-input"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="login-input"
                required
              />
              <button type="submit" className="login-button">
                Login
              </button>
              <a href="/forgot" className="forgot-password">Forgot Password?</a>
            </form>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </>
        ) : (
          <>
            <h1 className="success-title">{successMessage}</h1>
            <div className="search-section">
              <input
                type="text"
                placeholder="Search by username"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button onClick={handleSearch} className="search-button">
                Search Profile
              </button>
            </div>
            {profile && (
              <div className="profile-card">
                <h2 className="profile-title">{profile.username}</h2>
                <p>
                  Instagram:{" "}
                  <a
                    href={profile.socialLinks?.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-link"
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
                    className="profile-link"
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
