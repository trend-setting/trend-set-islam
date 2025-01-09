"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/lib/firebase/page";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
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
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(firestore, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserName(userData.userName || "Anonymous");
            setIsAdmin(userData.isAdmin || false);

            if (userData.isAdmin) {
              subscribeToUnansweredQuestions();
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

    return () => unsubscribeAuth();
  }, []);

  const subscribeToUnansweredQuestions = () => {
    const questionsRef = collection(firestore, "questions");
    const unansweredQuery = query(questionsRef, where("answered", "==", false));

    const unsubscribe = onSnapshot(unansweredQuery, (querySnapshot) => {
      setUnansweredCount(querySnapshot.size);
    });

    return () => unsubscribe();
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
      <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 bg-secondary text-primary shadow-md z-50">
        <div className="text-xl font-bold">
          <Link href="/">Admin Panel</Link>
        </div>
        <div className="text-primary">Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 bg-secondary text-primary shadow-md z-50">
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
            className="text-2xl cursor-pointer hover:text-muted"
          />
          {unansweredCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#fe1b1b] text-primary text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {unansweredCount}
            </span>
          )}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-primary text-black shadow-lg rounded">
              <p className="px-4 py-2">
                {unansweredCount} question{unansweredCount !== 1 ? "s" : ""} {unansweredCount !== 1 ? 'are' : 'is'}  pending to answer.
              </p>
            </div>
          )}
        </div>

        {/* User Info */}
        {userName ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="px-4 py-2 bg-light rounded hover:bg-muted text-primary"
            >
              {userName}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-light text-primary shadow-lg rounded">
                <Link href="/" className="block px-4 py-2 hover:bg-muted">
                  Homepage
                </Link>
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-left hover:bg-muted w-full"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="px-4 py-2 bg-light rounded hover:bg-muted text-primary">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavAdmin;
