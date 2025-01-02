"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, firestore } from "@/lib/firebase/page";
import { doc, setDoc } from "firebase/firestore";

export default function Signup(): React.ReactNode {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userPlace, setUserPlace] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const router = useRouter();

  // Predefined list of admin emails
  const adminEmails = [
    "trendsetadmin@gmail.com",
    "admin2@example.com",
    "admin3@example.com",
    "admin4@example.com",
  ];

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Create a new user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Determine if the user is an admin
      const isAdmin = adminEmails.includes(email);

      // Save user data to Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        email: user.email,
        userName: userName,
        userPlace: userPlace,
        isAdmin: isAdmin, // Mark as admin if the email matches
        uid: user.uid,
      });

      // Log out the user after account creation
      await signOut(auth);

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login"); // Redirect to the login page after a delay
      }, 2000);
    } catch (err: unknown) {
      setError("Error creating account. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded shadow-md">
        <h1 className="text-3xl font-bold mb-4">Sign Up</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-semibold">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="userName" className="block text-sm font-semibold">User Name</label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="userPlace" className="block text-sm font-semibold">Place</label>
            <input
              type="text"
              id="userPlace"
              value={userPlace}
              onChange={(e) => setUserPlace(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded w-full"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
