"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/lib/firebase/page";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const NavClient: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(firestore, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserName(userData.userName || "Anonymous");
            setIsAdmin(userData.isAdmin || false);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        setUserName(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleDropdown = (): void => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserName(null);
      setIsAdmin(false);
      router.push("/login"); // Redirect to login page after logout
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  if (loading) {
    return (
      <nav className="flex justify-between items-center px-6 py-4 bg-gray-800 text-white">
        <div className="text-xl font-bold">
          <Link href="/">My Dashboard</Link>
        </div>
        <div className="text-gray-400">Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-800 text-white">
      {/* Left Side: Website Name */}
      <div className="text-xl font-bold">
        <Link href="/">My Dashboard</Link>
      </div>

      {/* Right Side: User Info or Dropdown */}
      <div className="relative">
        {userName ? (
          <div>
            <button
              onClick={toggleDropdown}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              {userName}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded">
                <Link
                  href="/"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Homepage
                </Link>
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-left hover:bg-gray-100 w-full"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <button
              onClick={toggleDropdown}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              Ask a Question
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded">
                <Link
                  href="/login"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  href="/login"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Admin Login
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavClient;
