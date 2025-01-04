"use client";

import { useState, useEffect, useRef } from "react";
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
import Loader from "@/components/Loader";
import RichTextEditor from "@/components/RichTextEditor";
import { marked } from "marked";

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
  const [openAnswer, setOpenAnswer] = useState<string | null>(null); // For answered questions
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false); // For the sidebar

  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement | null>(null);

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

  const toggleAnswerVisibility = (id: string) => {
    setOpenAnswer((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.classList.remove("overflow-hidden");
    }
  }, [sidebarOpen]);

  if (loading) {
    return <Loader />;
  }

  if (!isAdmin) return null;

  return (
    <>
      <NavAdmin />
      <div className="flex flex-col bg-primary min-h-screen pt-24 px-6 md:px-10">
        <div className="w-full max-w-6xl mx-auto bg-secondary p-8 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold mb-6 text-center text-primary">
            Admin Dashboard
          </h1>
          {error && <p className="text-red-500 mb-6">{error}</p>}

          <div>
            <h2 className="text-xl font-semibold mb-6 text-primary">
              Answered Questions
            </h2>
            {answeredQuestions.length > 0 ? (
              <ul className="divide-y divide-primary">
                {answeredQuestions.map((question) => (
                  <li key={question.id} className="py-5">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-primary">{question.text}</p>
                        <span className="block text-sm text-muted">
                          Asked by: {question.userName} ({question.place})
                        </span>
                      </div>
                      <button
                        onClick={() => toggleAnswerVisibility(question.id)}
                        className="text-primary text-sm border rounded-lg px-3 py-2 duration-150 bg-light hover:bg-muted"
                      >
                        {openAnswer === question.id ? "Hide" : "Answer"}
                      </button>
                    </div>

                    {openAnswer === question.id && (
                      <div className="mt-4 px-4 py-2 bg-muted rounded-md">
                        <p
                          className="text-black"
                          dangerouslySetInnerHTML={{
                            __html: question.answer ? marked(question.answer) : "Answer is pending",
                          }}
                        ></p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-primary">No answered questions available.</p>
            )}
          </div>
        </div>

        {/* Sidebar for Unanswered Questions */}
        <div
          className="fixed top-1/2 right-0 transform -translate-y-1/2 bg-light text-primary w-10 h-32 flex items-center justify-center cursor-pointer rounded-l-lg hover:bg-muted"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="transform -rotate-90 text-sm font-bold">Unanswered Questions</span>
        </div>

        <div
          ref={sidebarRef}
          className={`fixed top-0 right-0 h-full w-80 bg-primary shadow-lg transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="p-6 overflow-y-auto h-full">
            <button
              className="text-black text-lg font-medium mb-6"
              onClick={() => setSidebarOpen(false)}
            >
              <IoCloseSharp className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-semibold mb-6 text-black">
              Unanswered Questions
            </h2>
            {unansweredQuestions.length > 0 ? (
              <ul>
                {unansweredQuestions.map((question) => (
                  <li key={question.id} className="mb-8 border border-[#ADC178] p-4 rounded-lg bg-secondary">
                    <p className="font-medium text-primary">{question.text}</p>
                    <p className="text-sm text-muted">
                      Asked by: {question.userName} ({question.place})
                    </p>
                    <RichTextEditor
                      value={answers[question.id] || ""}
                      onChange={(value) => handleAnswerChange(question.id, value)}
                      disabled={submitting === question.id}
                    />
                    <button
                      onClick={() => handleAnswerSubmit(question.id)}
                      className={`py-2 px-4 rounded w-full text-primary ${submitting === question.id
                        ? "bg-muted cursor-not-allowed"
                        : "bg-light hover:bg-muted"
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
