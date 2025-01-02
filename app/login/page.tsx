"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "@/lib/firebase/page";
import { doc, getDoc } from "firebase/firestore";
import { MdOutlineEmail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";

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
      setLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F0EAD2]">
        <p className="text-[#6C584C]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#DDE5B6] px-4 md:px-8">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-[#6C584C] text-center">Islam on Web</h1>
        <p className="text-sm font-light text-[#A98467] text-center mt-2">
          Log in to your account
        </p>
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-[#6C584C]">
              Email
            </label>
            <div className="relative flex items-center text-gray-400">
              <MdOutlineEmail className="absolute left-3 h-5 w-5 text-[#6C584C]" />
              <input
                type="email"
                id="email"
                placeholder="name@company.com"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 py-2 bg-[#F0EAD2] text-[#6C584C] border border-[#ADC178] rounded-lg focus:ring-[#ADC178] focus:border-[#ADC178] focus:outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-[#6C584C]">
              Password
            </label>
            <div className="relative flex items-center text-gray-400">
              <TbLockPassword className="absolute left-3 h-5 w-5 text-[#6C584C]" />
              <input
                type="password"
                id="password"
                placeholder="••••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 py-2 bg-[#F0EAD2] text-[#6C584C] border border-[#ADC178] rounded-lg focus:ring-[#ADC178] focus:border-[#ADC178] focus:outline-none"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-[#6C584C] text-white font-medium rounded-lg hover:bg-[#A98467] focus:ring-4 focus:ring-[#ADC178]"
            disabled={loggingIn}
          >
            {loggingIn ? "Logging In..." : "Log In"}
          </button>
          <p className="text-sm font-light text-center text-[#A98467]">
            Don&apos;t have an account?{" "}
            <span
              onClick={() => router.push("/signup")}
              className="font-medium text-[#6C584C] hover:underline cursor-pointer"
            >
              Sign Up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
