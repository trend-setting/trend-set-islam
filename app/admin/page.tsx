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
  const [answer, setAnswer] = useState<string>("");
  const [submitting, setSubmitting] = useState<string | null>(null); // Track the question being submitted
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

  const handleAnswerSubmit = async (questionId: string): Promise<void> => {
    setSubmitting(questionId); // Set the current question being submitted
    try {
      const questionRef = doc(firestore, "questions", questionId);
      await updateDoc(questionRef, {
        answer: answer.trim(),
        answered: true,
      });

      setAnswer("");
      fetchQuestions();
    } catch {
      setError("Error submitting answer");
    } finally {
      setSubmitting(null); // Reset the submitting state
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!isAdmin) return null;

  return (
    <>
      <NavAdmin />
      <div className="flex flex-col bg-gray-100 min-h-screen pt-24 px-4 md:px-8">
        <div className="w-full max-w-6xl mx-auto bg-white p-6 rounded shadow-md">
          <h1 className="text-3xl font-bold mb-4 text-center">Admin Dashboard</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div>
            <h2 className="text-xl font-semibold mb-4">Answered Questions</h2>
            {answeredQuestions.length > 0 ? (
              <ul>
                {answeredQuestions.map((question) => (
                  <li key={question.id} className="mb-4">
                    <p className="font-semibold">{question.text}</p>
                    <p className="text-gray-500">
                      Asked by: {question.userName} ({question.place})
                    </p>
                    <p className="text-green-500 mt-2">Answer: {question.answer}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No answered questions</p>
            )}
          </div>
        </div>

        {/* Sidebar Trigger */}
        <div
          className="fixed top-1/2 right-0 transform -translate-y-1/2 bg-blue-500 text-white w-10 h-32 flex items-center justify-center cursor-pointer rounded-l-lg hover:bg-blue-600"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="transform -rotate-90 text-sm font-bold">
            Unanswered
          </span>
        </div>

        {/* Sidebar */}
        <div
          className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="p-4">
            <button
              className="text-red-500 text-xl font-bold mb-4"
              onClick={() => setSidebarOpen(false)}
            >
              Close
            </button>
            <h2 className="text-xl font-semibold mb-4">Unanswered Questions</h2>
            {unansweredQuestions.length > 0 ? (
              <ul>
                {unansweredQuestions.map((question) => (
                  <li key={question.id} className="mb-6">
                    <p className="font-semibold">{question.text}</p>
                    <p className="text-gray-500">
                      Asked by: {question.userName} ({question.place})
                    </p>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="w-full p-2 border rounded mt-2 mb-4"
                      placeholder="Write your answer here..."
                      disabled={submitting === question.id} // Disable if this question is being submitted
                    />
                    <button
                      onClick={() => handleAnswerSubmit(question.id)}
                      className={`py-2 px-4 rounded w-full ${
                        submitting === question.id
                          ? "bg-green-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                      disabled={submitting === question.id} // Disable if this question is being submitted
                    >
                      {submitting === question.id
                        ? "Submitting Answer..."
                        : "Submit Answer"}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No unanswered questions</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
