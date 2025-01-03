"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, firestore } from "@/lib/firebase/page";
import { doc, setDoc } from "firebase/firestore";
import { CiUser } from "react-icons/ci";
import { MdOutlineEmail, MdWorkOutline } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";

export default function Signup(): React.ReactNode {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userPlace, setUserPlace] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const router = useRouter();

  const adminEmails = [
    "shuhaib@islam.com",
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const isAdmin = adminEmails.includes(email);

      await setDoc(doc(firestore, "users", user.uid), {
        email: user.email,
        userName: userName,
        userPlace: userPlace,
        isAdmin: isAdmin,
        uid: user.uid,
      });

      await signOut(auth);

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("auth/email-already-in-use")) {
          setError("Email is already taken.");
        } else {
          setError("Error creating account. Please try again.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-primary px-4 md:px-8">
      <div className="w-full max-w-md p-8 bg-secondary rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-primary text-center">Ask and Solve</h1>
        <p className="text-sm font-light text-primary text-center mt-2">
          Sign up for an account
        </p>
        <form onSubmit={handleSignup} className="mt-8 space-y-6">
          <div>
            <label htmlFor="userName" className="block mb-2 text-sm font-medium text-primary">
              Name
            </label>
            <div className="relative flex items-center text-black">
              <CiUser className="absolute left-3 h-5 w-5 text-black" />
              <input
                type="text"
                id="userName"
                placeholder="Your Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full pl-10 py-2 bg-muted text-black border border-light rounded-lg focus:ring-black focus:border-black focus:outline-none placeholder-black"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="userPlace" className="block mb-2 text-sm font-medium text-primary">
              Occupation
            </label>
            <div className="relative flex items-center text-gray-400">
            <MdWorkOutline className="absolute left-3 h-5 w-5 text-black" />
              <input
                type="text"
                id="userPlace"
                placeholder="Your Occupation"
                value={userPlace}
                onChange={(e) => setUserPlace(e.target.value)}
                className="w-full pl-10 py-2 bg-muted text-black border border-light rounded-lg focus:ring-black focus:border-black focus:outline-none placeholder-black"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-primary">
              Email
            </label>
            <div className="relative flex items-center text-gray-400">
              <MdOutlineEmail className="absolute left-3 h-5 w-5 text-black" />
              <input
                type="email"
                id="email"
                placeholder="name@any.com"
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
            <div className="relative flex items-center text-gray-400">
              <TbLockPassword className="absolute left-3 h-5 w-5 text-black" />
              <input
                type="password"
                id="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 py-2 bg-muted text-black border border-light rounded-lg focus:ring-black focus:border-black focus:outline-none placeholder-black"
                required
              />
            </div>
          </div>
          {error && <div className="text-red-500 text-center mb-4">{error}</div>}
          {success && <div className="text-green-500 text-center mb-4">{success}</div>}
          <button
            type="submit"
            className="w-full py-2 bg-light text-primary font-medium rounded-lg hover:bg-muted focus:ring-4 focus:ring-black"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
          <p className="text-sm font-light text-center text-primary">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="font-medium text-muted hover:underline cursor-pointer"
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
