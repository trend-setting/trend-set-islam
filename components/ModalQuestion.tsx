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
import { IoCloseSharp } from "react-icons/io5";

interface ModalQuestionProps {
  onClose: () => void;
}

const ModalQuestion: React.FC<ModalQuestionProps> = ({ onClose }) => {
  const [question, setQuestion] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [userName, setUserName] = useState<string>("Loading...");
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
          setUserName(userData.userName || "Loading...");
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
      className="w-[90dvw] max-w-md p-6 rounded shadow-md relative bg-secondary"  // Background color from palette
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 text-primary hover:text-muted" // Close button colors from palette
      >
        <IoCloseSharp className="h-6 w-6" />
      </button>
      <h2 className="text-xl font-bold mb-4 text-primary">Ask a Question</h2>  {/* Title color */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <p className="text-primary mb-4">Hey, {userName} feel free to ask</p>  {/* Text color */}
      <textarea
        placeholder="Type your question here in any language you prefer..."
        className="w-full p-2 border rounded mb-4 border-black" // Border color from palette
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        disabled={isSubmitting}
      ></textarea>
      <button
        type="submit"
        className={`py-2 px-4 rounded w-full ${isSubmitting ? "bg-muted text-primary cursor-not-allowed" : "bg-light text-primary hover:bg-muted"}`}  // Button colors from palette
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting Question..." : "Submit Question"}
      </button>
    </form>
  );
};

export default ModalQuestion;
