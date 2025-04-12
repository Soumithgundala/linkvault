import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase"; // Firebase configuration
import Link from "next/link";
import Navbar from "@/components/navbar";
// import "@/styles/globals.css"; // CSS for styling
// import "@/styles/accont.css";

// Define an interface for Firebase errors
interface FirebaseErrorType {
  code: string;
  message: string;
}

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

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmailSelected, setIsEmailSelected] = useState(true);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      if (isEmailSelected) {
        // Create a new user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save additional user data to Firestore
        await setDoc(doc(db, "users", user.uid), {
          username: username.toLowerCase(),
          createdAt: new Date(),
        });

        // Redirect or show success message here (e.g., navigate to login or profile page)
        alert("Account created successfully! Please log in.");
      } else {
        // For phone number, you would typically use Firebase's phone authentication
        // However, this requires additional setup and is not covered here
        alert("Phone number signup is not implemented yet.");
      }
    } catch (error: unknown) {
      // Handle errors during signup
      if (isFirebaseError(error)) {
        if (error.code === "auth/email-already-in-use") {
          setErrorMessage("This email is already registered. Please log in or use a different email.");
        } else if (error.code === "auth/weak-password") {
          setErrorMessage("Password is too weak. Please use a stronger password.");
        } else {
          console.error("Error signing up:", error);
          setErrorMessage("An error occurred during signup. Please try again.");
        }
      } else {
        console.error("Unexpected error signing up:", error);
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="signup-background">
        <div className="signup-card">
          <h1 className="signup-title">Create Your Account</h1>

          {/* Signup form */}
          <form onSubmit={handleSignUp} className="signup-form">
            {/* Email or Phone Number input */}
            <div className="input-group">
              <label>
                <input
                  type="radio"
                  checked={isEmailSelected}
                  onChange={() => setIsEmailSelected(true)}
                />
                Email
              </label>
              <label>
                <input
                  type="radio"
                  checked={!isEmailSelected}
                  onChange={() => setIsEmailSelected(false)}
                />
                Phone Number
              </label>
            </div>

            {isEmailSelected ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="signup-input"
                required
              />
            ) : (
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number"
                className="signup-input"
                required
              />
            )}

            {/* Password input */}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="signup-input"
              required
            />

            {/* Username input */}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="signup-input"
              required
            />

            {/* Link to login page */}
            <Link href="/login" className="signin-link">
              Already have an account? Sign In
            </Link>

            {/* Submit button */}
            <button type="submit" className="signup-button">
              Sign Up
            </button>
          </form>

          {/* Error message display */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      </div>
    </>
  );
}
