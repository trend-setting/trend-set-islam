"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/lib/firebase/page";
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

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

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

  const toggleDropdown = (): void => {
    setDropdownOpen(!dropdownOpen);
    setNotificationsOpen(false);
  };

  const toggleNotifications = (): void => {
    setNotificationsOpen(!notificationsOpen);
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setDropdownOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      <nav className="flex justify-between items-center px-6 py-4 bg-[#6C584C] text-[#F0EAD2]">
        <div className="text-xl font-bold">
          <Link href="/">Admin Panel</Link>
        </div>
        <div className="text-[#A98467]">Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-[#6C584C] text-[#F0EAD2]">
      {/* Left Side: Website Name */}
      <div className="text-xl font-bold">
        <Link href="/">Admin Panel</Link>
      </div>

      {/* Right Side: Notifications and User Info */}
      <div className="flex items-center space-x-4">
        {/* Notification Icon */}
        <div className="relative" ref={notificationRef}>
          <IoMdNotifications
            onClick={toggleNotifications}
            className="text-2xl cursor-pointer hover:text-[#ADC178]"
          />
          {unansweredCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#fe1b1b] text-[#ffffff] text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {unansweredCount}
            </span>
          )}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#F0EAD2] text-[#6C584C] shadow-lg rounded">
              <p className="px-4 py-2">
                {unansweredCount} question{unansweredCount !== 1 ? "s" : ""} are pending to answer.
              </p>
            </div>
          )}
        </div>

        {/* User Info */}
        {userName ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="px-4 py-2 bg-[#DDE5B6] rounded hover:bg-[#ADC178] text-[#6C584C]"
            >
              {userName}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#F0EAD2] text-[#6C584C] shadow-lg rounded">
                <Link href="/" className="block px-4 py-2 hover:bg-[#DDE5B6]">
                  Homepage
                </Link>
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-left hover:bg-[#DDE5B6] w-full"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="px-4 py-2 bg-[#DDE5B6] rounded hover:bg-[#ADC178] text-[#6C584C]">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavAdmin;
