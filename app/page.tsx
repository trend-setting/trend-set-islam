'use client';
import { useEffect, useState } from "react";
import { firestore } from "@/lib/firebase/page"; // Firestore import
import { getDocs, collection, query, where } from "firebase/firestore"; // Firestore query functions
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader"; // Import the Loader component
import { marked } from "marked";

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
  const [showLoader, setShowLoader] = useState<boolean>(true); // Control loader visibility
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

    // Show loader for 3 seconds regardless of loading state
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 3000);

    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  const toggleAnswer = (id: string) => {
    setOpenAnswer(openAnswer === id ? null : id); // Toggle answer visibility
  };

  if (showLoader) {
    return <Loader />; // Display the loader for 3 seconds
  }

  return (
    <div className="flex flex-col min-h-screen bg-primary">
      <Navbar />
      <div className="flex-grow pt-20">
        <div className="max-w-2xl mx-auto px-4">
          {loading ? (
            <p className="text-center text-secondary mt-12">Loading questions...</p>
          ) : questions.length === 0 ? (
            <p className="text-center text-secondary mt-12">
              No questions found. Be the first person to ask a question.
            </p>
          ) : (
            <>
              <div className="bg-secondary p-5 rounded-lg my-2">
                <ul className="divide-y divide-primary">
                  {questions.map((question) => (
                    <li key={question.id} className="pt-5 mb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div>
                            <p className="font-semibold text-primary">{question.text}</p>
                            <span className="block text-sm text-muted">{question.userName}</span>
                            <span className="block text-sm text-muted">{question.place}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleAnswer(question.id)}
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
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
