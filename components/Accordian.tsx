"use client";

import { useEffect, useState } from "react";
import { auth, firestore } from "@/app/firebase/page";
import { collection, getDocs, query, where } from "firebase/firestore";

interface Question {
  id: string;
  text: string;
  answer?: string;
  answered: boolean;
}

const AccordionOutline: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
          collection(firestore, "questions"),
          where("userId", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        const questionsData: Question[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (questions.length === 0) {
    return (
      <div className="w-full p-6 text-center text-slate-500">
        Feel free to ask Islamic questions. We are here to help you.
      </div>
    );
  }

  return (
    <section className="w-full divide-y divide-slate-200 rounded border border-slate-200 bg-white">
      {questions.map((question) => (
        <details key={question.id} className="group p-4">
          <summary className="relative cursor-pointer list-none pr-8 font-medium text-slate-700 transition-colors duration-300 focus-visible:outline-none group-hover:text-slate-900 [&::-webkit-details-marker]:hidden">
            {question.text}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute right-0 top-1 h-4 w-4 shrink-0 stroke-slate-700 transition duration-300 group-open:rotate-45"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-labelledby={`title-${question.id}`}
            >
              <title id={`title-${question.id}`}>Toggle Answer</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </summary>
          <p className="mt-4 text-slate-500">
            {question.answered
              ? `Answer: ${question.answer}`
              : "Answer is pending"}
          </p>
        </details>
      ))}
    </section>
  );
};

export default AccordionOutline;