"use client";

import { useState, useEffect } from "react";
import { auth, firestore } from "@/lib/firebase/page";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

interface ModalQuestionProps {
  onClose: () => void;
}

const ModalQuestion: React.FC<ModalQuestionProps> = ({ onClose }) => {
  const [question, setQuestion] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [userName, setUserName] = useState<string>("Anonymous");
  const [place, setPlace] = useState<string>("Unknown");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserName(userData.userName || "Anonymous");
          setPlace(userData.userPlace || "Unknown");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("User not logged in.");
        setIsSubmitting(false);
        return;
      }

      await addDoc(collection(firestore, "questions"), {
        text: question.trim(),
        userId: user.uid,
        userName,
        place,
        answered: false,
        createdAt: serverTimestamp(),
      });

      setQuestion("");
      alert("Question submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Error submitting question:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md p-6 rounded shadow-md relative bg-[#F0EAD2]"  // Background color from palette
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 text-[#6C584C] hover:text-[#A98467]" // Close button colors from palette
      >
        ×
      </button>
      <h2 className="text-xl font-bold mb-4 text-[#6C584C]">Ask a Question</h2>  {/* Title color */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <p className="text-[#6C584C] mb-4">Welcome, {userName} ({place})</p>  {/* Text color */}
      <textarea
        placeholder="Type your question here..."
        className="w-full p-2 border rounded mb-4 border-[#ADC178]" // Border color from palette
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        disabled={isSubmitting}
      ></textarea>
      <button
        type="submit"
        className={`py-2 px-4 rounded w-full ${isSubmitting ? "bg-[#DDE5B6] text-[#6C584C] cursor-not-allowed" : "bg-[#ADC178] text-white hover:bg-[#A98467]"}`}  // Button colors from palette
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting Question..." : "Submit Question"}
      </button>
    </form>
  );
};

export default ModalQuestion;
