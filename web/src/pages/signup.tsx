import { useState } from "react";
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  // add other social links as needed

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Save profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username.toLowerCase(),
        socialLinks: {
          instagram,
          twitter,
          // add other links
        },
        createdAt: new Date()
      });
      // Redirect or show success message
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="max-w-md mx-auto p-4">
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      <input type="text" placeholder="Username (unique)" value={username} onChange={e => setUsername(e.target.value)} required />
      <input type="url" placeholder="Instagram Link" value={instagram} onChange={e => setInstagram(e.target.value)} />
      <input type="url" placeholder="Twitter Link" value={twitter} onChange={e => setTwitter(e.target.value)} />
      {/* add more inputs as needed */}
      <button type="submit">Sign Up</button>
    </form>
  );
}