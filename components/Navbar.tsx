'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, firestore } from '@/lib/firebase/page';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user info from Firestore
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserName(userData.userName || 'Anonymous');
            setIsAdmin(userData.isAdmin || false);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      } else {
        setUserName(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserName(null);
      setIsAdmin(false);
      setDropdownOpen(false);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  if (loading) {
    return (
      <nav className="flex justify-between items-center px-6 py-4 bg-[#ADC178] text-[#6C584C]">
        <div className="text-xl font-bold">
          <Link href="/">Islamic Dought</Link>
        </div>
        <div className="text-[#A98467]">Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-[#ADC178] text-[#6C584C]">
      {/* Left Side: Website Name */}
      <div className="text-xl font-bold">
        <Link href="/">Islamic Dought</Link>
      </div>

      {/* Right Side: User Info or Dropdown */}
      <div className="relative">
        {userName ? (
          <div>
            <button
              onClick={toggleDropdown}
              className="px-4 py-2 bg-[#A98467] rounded hover:bg-[#6C584C] text-[#F0EAD2]"
            >
              {userName}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#F0EAD2] text-[#6C584C] shadow-lg rounded">
                <Link
                  href={isAdmin ? "/admin" : "/dashboard"}
                  className="block px-4 py-2 hover:bg-[#DDE5B6]"
                >
                  My Dashboard
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
          <div>
            <button
              onClick={toggleDropdown}
              className="px-4 py-2 bg-[#A98467] rounded hover:bg-[#6C584C] text-[#F0EAD2]"
            >
              Ask a Question
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#F0EAD2] text-[#6C584C] shadow-lg rounded">
                <Link
                  href="/login"
                  className="block px-4 py-2 hover:bg-[#DDE5B6]"
                >
                  Login
                </Link>
                <Link
                  href="/login"
                  className="block px-4 py-2 hover:bg-[#DDE5B6]"
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

export default Navbar;
