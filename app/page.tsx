'use client';
import { useEffect, useState } from "react";
import { firestore } from "@/lib/firebase/page"; // Firestore import
import { getDocs, collection, query, where } from "firebase/firestore"; // Firestore query functions
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  const [openAnswer, setOpenAnswer] = useState<string | null>(null); // State to track open answer

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

  const toggleAnswer = (id: string) => {
    setOpenAnswer(openAnswer === id ? null : id); // Toggle answer visibility
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F0EAD2]">
        <p className="text-[#6C584C]">Loading Homepage...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#DDE5B6]">
      <Navbar />
      <div className="flex-grow pt-20">
        <div className="max-w-2xl mx-auto px-4">
          <ul className="mt-12 divide-y divide-[#ADC178]">
            {questions.map((question) => (
              <li key={question.id} className="pt-5 mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div>
                      <p className="font-semibold text-[#6C584C]">{question.text}</p>
                      <span className="block text-sm text-[#A98467]">{question.userName}</span>
                      <span className="block text-sm text-[#A98467]">{question.place}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAnswer(question.id)}
                    className="text-[#6C584C] text-sm border rounded-lg px-3 py-2 duration-150 bg-[#F0EAD2] hover:bg-[#DDE5B6]"
                  >
                    {openAnswer === question.id ? "Hide" : "Answer"}
                  </button>
                </div>

                {openAnswer === question.id && (
                  <div className="mt-4 px-4 py-2 bg-[#ADC178] rounded-md">
                    <p className="text-[#6C584C]">{question.answer}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
