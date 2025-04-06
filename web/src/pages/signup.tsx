import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        username: username.toLowerCase(),
        socialLinks: { instagram, twitter },
        createdAt: new Date(),
      });
      // Redirect or show success message here
    } catch (error: unknown) {
      // Explicitly cast error to an object with 'code' and 'message'
      const err = error as { code: string; message: string };
      if (err.code === "auth/email-already-in-use") {
        setErrorMessage("This email is already registered. Please log in or use a different email.");
      } else if (err.code === "permission-denied") {
        setErrorMessage("Permission denied. Please ensure you are logged in and try again.");
      } else {
        console.error("Error signing up:", err);
        setErrorMessage("An error occurred during signup. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow-lg mt-10">
      <h1 className="text-3xl font-bold text-center mb-6">Create Your Account</h1>
      <form onSubmit={handleSignUp} className="space-y-4">
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
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
        <input
          type="url"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="Instagram Link"
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <input
          type="url"
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
          placeholder="Twitter Link"
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition">
          Sign Up
        </button>
      </form>
      {errorMessage && <p className="mt-4 text-red-500 text-center">{errorMessage}</p>}
    </div>
  );
}
