"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/app/firebase/page";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { IoMdNotifications } from "react-icons/io";

const NavAdmin: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState<number>(0);
  const router = useRouter();

  // Fetch user data and unanswered questions
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

            if (userData.isAdmin) {
              fetchUnansweredQuestions();
            }
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

  // Fetch unanswered questions
  const fetchUnansweredQuestions = async () => {
    try {
      const questionsRef = collection(firestore, "questions");
      const unansweredQuery = query(questionsRef, where("answered", "==", false));
      const querySnapshot = await getDocs(unansweredQuery);
      setUnansweredCount(querySnapshot.size);
    } catch (err) {
      console.error("Error fetching unanswered questions:", err);
    }
  };

  // Toggle dropdowns
  const toggleDropdown = (): void => {
    setDropdownOpen((prev) => !prev);
    setNotificationsOpen(false);
  };

  const toggleNotifications = (): void => {
    setNotificationsOpen((prev) => !prev);
    setDropdownOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown, .notification")) {
        setDropdownOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserName(null);
      setIsAdmin(false);
      router.push("/login");
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

      {/* Right Side: Notifications and User Info */}
      <div className="flex items-center space-x-4">
        {/* Notification Icon */}
        <div className="relative notification">
          <IoMdNotifications
            onClick={toggleNotifications}
            className="text-2xl cursor-pointer hover:text-gray-300"
          />
          {unansweredCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {unansweredCount}
            </span>
          )}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white text-black shadow-lg rounded">
              <p className="px-4 py-2">
                {unansweredCount} question{unansweredCount !== 1 ? "s" : ""} are pending to answer.
              </p>
            </div>
          )}
        </div>

        {/* User Info */}
        {userName ? (
          <div className="relative dropdown">
            <button
              onClick={toggleDropdown}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              {userName}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded">
                <Link href="/" className="block px-4 py-2 hover:bg-gray-100">
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
          <Link href="/login" className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavAdmin;
