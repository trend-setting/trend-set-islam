'use client';
import { useEffect, useState } from "react";
import { firestore } from "@/app/firebase/page"; // Firestore import
import { getDocs, collection, query, where } from "firebase/firestore"; // Firestore query functions
import Navbar from "@/components/Navbar";

type Question = {
  id: string;
  text: string;
  userName: string;
  place: string;
  answer: string;
  answered: boolean;
};

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsQuery = query(
          collection(firestore, "questions"),
          where("answered", "==", true) // Fetch only answered questions
        );

        const querySnapshot = await getDocs(questionsQuery);
        const questionsData: Question[] = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Question[];

        setQuestions(questionsData);
      } catch (error) {
        console.error("Error fetching questions: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p>Loading questions...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="w-full max-w-4xl bg-white p-6 rounded shadow-md">
          <h1 className="text-3xl font-bold mb-4">Public Q&A</h1>
          {questions.length > 0 ? (
            <ul>
              {questions.map((question) => (
                <li key={question.id} className="mb-4">
                  <p className="font-semibold">{question.text}</p>
                  <p className="text-gray-500">
                    Asked by: {question.userName} ({question.place})
                  </p>
                  <p className="text-green-500">Answered: {question.answer}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No answered questions available.</p>
          )}
        </div>
      </div>
    </>
  );
}
