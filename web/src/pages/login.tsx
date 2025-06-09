// In src/pages/login.tsx

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase"; // db is not used, so we can remove it
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { Eye, EyeOff } from "react-feather";

// Define an interface for Firebase errors (This is good, keep it)
interface FirebaseErrorType {
  code: string;
  message: string;
}

// Type guard to check if an error is a FirebaseErrorType (Keep this too)
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

// Simplified Login Component
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(""); // Reset errors on new attempt

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On success, redirect immediately.
      router.push("/profile");
    } catch (error: unknown) {
      if (isFirebaseError(error)) {
        if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
          setErrorMessage("Invalid credentials. Please check your email and password.");
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

  // The JSX is now much simpler, with no conditional rendering for a logged-in state.
  return (
    <>
      <Navbar />
      <div className="login-page">
        <div className="login-card">
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
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="login-input"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="toggle-password-button"
              >
                {showPassword ? (
                  <EyeOff size={20} className="password-icon" />
                ) : (
                  <Eye size={20} className="password-icon" />
                )}
              </button>
            </div>
            <Link href="/signup" className="form-link">
              Don&apos;t have an account? Sign Up
            </Link>
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      </div>
    </>
  );
}