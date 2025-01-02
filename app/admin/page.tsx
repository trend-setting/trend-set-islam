"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/lib/firebase/page";
import {
  getDocs,
  collection,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import NavAdmin from "@/components/NavAdmin";
import { IoCloseSharp } from "react-icons/io5";

interface Question {
  id: string;
  text: string;
  userName: string;
  place: string;
  answered: boolean;
  answer?: string;
}

export default function AdminDashboard(): React.ReactNode {
  const [unansweredQuestions, setUnansweredQuestions] = useState<Question[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const userDocRef = collection(firestore, "users");
        const q = query(userDocRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();

          if (userData.isAdmin) {
            setIsAdmin(true);
            fetchQuestions();
          } else {
            router.push("/");
          }
        } else {
          router.push("/login");
        }
      } catch {
        setError("Error fetching user data");
        router.push("/login");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchQuestions = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "questions"));
      const unanswered: Question[] = [];
      const answered: Question[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Question;
        if (data.answered) {
          answered.push({ ...data, id: doc.id });
        } else {
          unanswered.push({ ...data, id: doc.id });
        }
      });

      setUnansweredQuestions(unanswered);
      setAnsweredQuestions(answered);
    } catch {
      setError("Error fetching questions");
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleAnswerSubmit = async (questionId: string): Promise<void> => {
    setSubmitting(questionId);
    try {
      const questionRef = doc(firestore, "questions", questionId);
      await updateDoc(questionRef, {
        answer: answers[questionId]?.trim(),
        answered: true,
      });

      setAnswers((prev) => ({ ...prev, [questionId]: "" }));
      fetchQuestions();
    } catch {
      setError("Error submitting answer");
    } finally {
      setSubmitting(null);
    }
  };

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => document.body.classList.remove("overflow-hidden");
  }, [sidebarOpen]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F0EAD2]">
        <p className="text-[#6C584C]">Loading admin dashboard...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <NavAdmin />
      <div className="flex flex-col bg-[#F0EAD2] min-h-screen pt-24 px-6 md:px-10">
        <div className="w-full max-w-6xl mx-auto bg-[#DDE5B6] p-8 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold mb-6 text-center text-[#6C584C]">
            Admin Dashboard
          </h1>
          {error && <p className="text-[#A98467] mb-6">{error}</p>}

          <div>
            <h2 className="text-xl font-semibold mb-6 text-[#6C584C]">
              Answered Questions
            </h2>
            {answeredQuestions.length > 0 ? (
              <ul className="">
                {answeredQuestions.map((question) => (
                  <li key={question.id} className="mb-6 border border-[#ADC178] p-4 rounded-lg">
                    <p className="font-medium text-[#6C584C]">{question.text}</p>
                    <p className="text-sm text-[#A98467]">
                      Asked by: {question.userName} ({question.place})
                    </p>
                    <p className="text-[#6C584C] mt-2 font-medium">
                      Answer: {question.answer}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[#A98467]">No answered questions</p>
            )}
          </div>
        </div>

        <div
          className="fixed top-1/2 right-0 transform -translate-y-1/2 bg-[#6C584C] text-white w-10 h-32 flex items-center justify-center cursor-pointer rounded-l-lg hover:bg-[#6C584C]"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="transform -rotate-90 text-sm font-bold">Unanswered Questions</span>
        </div>

        <div
          className={`fixed top-0 right-0 h-full w-80 bg-[#F0EAD2] shadow-lg transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 overflow-y-auto h-full">
            <button
              className="text-[#A98467] text-lg font-medium mb-6"
              onClick={() => setSidebarOpen(false)}
            >
              <IoCloseSharp className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-semibold mb-6 text-[#6C584C]">
              Unanswered Questions
            </h2>
            {unansweredQuestions.length > 0 ? (
              <ul>
                {unansweredQuestions.map((question) => (
                  <li key={question.id} className="mb-8 border border-[#ADC178] p-4 rounded-lg">
                    <p className="font-medium text-[#6C584C]">{question.text}</p>
                    <p className="text-sm text-[#A98467]">
                      Asked by: {question.userName} ({question.place})
                    </p>
                    <textarea
                      value={answers[question.id] || ""}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-full p-3 border rounded-lg border-[#ADC178] mt-3 mb-4 bg-[#F0EAD2] focus:ring-[#ADC178] focus:border-[#ADC178]"
                      placeholder="Write your answer here..."
                      disabled={submitting === question.id}
                    />
                    <button
                      onClick={() => handleAnswerSubmit(question.id)}
                      className={`py-2 px-4 rounded w-full text-white ${
                        submitting === question.id
                          ? "bg-[#A98467] cursor-not-allowed"
                          : "bg-[#ADC178] hover:bg-[#6C584C]"
                      }`}
                      disabled={submitting === question.id}
                    >
                      {submitting === question.id ? "Submitting..." : "Submit Answer"}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[#A98467]">No unanswered questions</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
