"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase/page";
import NavClient from "@/components/NavClient";
import AccordionOutline from "@/components/Accordian";
import ModalQuestion from "@/components/ModalQuestion";
import { CiCirclePlus } from "react-icons/ci";

const Dashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/"); // Redirect to homepage if not logged in
        return;
      }

      try {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.isAdmin) {
            router.push("/admin"); // Redirect admin users to admin page
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const toggleModal = (): void => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <NavClient />
      <div className="h-screen p-4 bg-primary">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">My Questions</h1>
          <button
            onClick={toggleModal}
            className="bg-light text-primary py-2 px-4 rounded hover:bg-muted flex items-center gap-x-2 font-semibold"
          >
            Ask a Question <CiCirclePlus className="text-primary h-6 w-7 font-semibold" />
          </button>
        </div>
        <AccordionOutline />
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-primary bg-opacity-50 backdrop-blur-sm">
            <ModalQuestion onClose={toggleModal} />
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
