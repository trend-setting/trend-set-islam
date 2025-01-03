"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "@/lib/firebase/page";
import { doc, getDoc } from "firebase/firestore";
import { MdOutlineEmail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import Loader from "@/components/Loader";

export default function LoginPage(): React.ReactNode {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [loggingIn, setLoggingIn] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(firestore, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.isAdmin) {
              router.push("/");
            } else {
              router.push("/");
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

      const userDocRef = doc(firestore, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.isAdmin) {
          router.push("/");
        } else {
          router.push("/");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (
          err.message.includes("auth/user-not-found") ||
          err.message.includes("auth/wrong-password")
        ) {
          setError("Email or password is incorrect.");
        } else {
          setError("Email or password is incorrect. Please try again.");
        }
      }
    } finally {
      setLoggingIn(false);
    }
  };

  if (loading) {
    return <Loader/>
  }

  return (
    <div className="flex items-center justify-center h-screen bg-primary px-4 md:px-8">
      <div className="w-full max-w-md p-8 bg-secondary rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-primary text-center">Ask and Solve</h1>
        <p className="text-sm font-light text-primary text-center mt-2">
          Log in to your account
        </p>
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-primary">
              Email
            </label>
            <div className="relative flex items-center text-black">
              <MdOutlineEmail className="absolute left-3 h-5 w-5 text-black" />
              <input
                type="email"
                id="email"
                placeholder="name@any.com"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 py-2 bg-muted text-black border border-light rounded-lg focus:ring-black focus:border-black focus:outline-none placeholder-black"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-primary">
              Password
            </label>
            <div className="relative flex items-center text-black">
              <TbLockPassword className="absolute left-3 h-5 w-5 text-black" />
              <input
                type="password"
                id="password"
                placeholder="••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 py-2 bg-muted text-black border border-light rounded-lg focus:ring-black focus:border-black focus:outline-none placeholder-black"
                required
              />
            </div>
          </div>
          {error && <div className="text-red-500 text-center mb-4">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 bg-light text-primary font-medium rounded-lg hover:bg-muted focus:ring-4 focus:ring-black"
            disabled={loggingIn}
          >
            {loggingIn ? "Logging In..." : "Log In"}
          </button>
          <p className="text-sm font-light text-center text-primary">
            Don&apos;t have an account?{" "}
            <span
              onClick={() => router.push("/signup")}
              className="font-medium text-muted hover:underline cursor-pointer"
            >
              Sign Up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
