"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "@/lib/firebase/page";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage(): React.ReactNode {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [loggingIn, setLoggingIn] = useState<boolean>(false); // Added state to track login process
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard or admin page if the user is already logged in
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(firestore, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.isAdmin) {
              router.push("/"); // Redirect to admin page
            } else {
              router.push("/"); // Redirect to dashboard
            }
          }
        } catch (err) {
          console.error("Error checking user role:", err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoggingIn(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.isAdmin) {
          router.push("/"); // Redirect to admin page if user is admin
        } else {
          router.push("/"); // Redirect to dashboard if user is client
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("auth/user-not-found")) {
          setError("No account found with this email. Please sign up.");
        } else if (err.message.includes("auth/wrong-password")) {
          setError("Incorrect password. Please try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoggingIn(false); // Reset login state
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Log In</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <button
          type="submit"
          className={`py-2 px-4 rounded w-full ${
            loggingIn ? "bg-blue-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          disabled={loggingIn} // Disable the button while logging in
        >
          {loggingIn ? "Logging In..." : "Log In"}
        </button>
        <p className="text-gray-600 mt-4 text-center">
          Don't have an account?{" "}
          <span
            onClick={() => router.push("/signup")}
            className="text-blue-500 cursor-pointer underline"
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
}
