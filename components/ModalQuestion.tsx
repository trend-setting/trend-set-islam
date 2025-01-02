"use client";

import { useState, useEffect } from "react";
import { auth, firestore } from "@/lib/firebase/page";
import { addDoc, collection, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";

interface ModalQuestionProps {
  onClose: () => void;
}

const ModalQuestion: React.FC<ModalQuestionProps> = ({ onClose }) => {
  const [question, setQuestion] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [place, setPlace] = useState<string>("");
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

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("User not logged in.");
        return;
      }

      await addDoc(collection(firestore, "questions"), {
        text: question,
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
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white p-6 rounded shadow-md relative"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
      >
        ×
      </button>
      <h2 className="text-xl font-bold mb-4">Ask a Question</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <p className="text-gray-700 mb-4">
        Welcome, {userName} ({place})
      </p>
      <textarea
        placeholder="Type your question here..."
        className="w-full p-2 border rounded mb-4"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      ></textarea>
      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded w-full"
      >
        Submit Question
      </button>
    </form>
  );
};

export default ModalQuestion;
