'use client';
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // For programmatic navigation
import { BsFacebook, BsInstagram, BsWhatsapp, BsYoutube } from "react-icons/bs";
import { CiUser } from "react-icons/ci";
import { MdOutlineEmail } from "react-icons/md";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (status === "error") {
      setStatus("idle");
      setErrorMessage(null); // Clear error message
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" }); // Reset form
        setTimeout(() => {
          router.push("/dashboard"); // Redirect to homepage
        }, 2000);
      } else {
        setStatus("error");
        setErrorMessage("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus("error");
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-primary px-4 md:px-8">
      <div className="w-full max-w-md p-8 bg-secondary rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-primary text-center">Contact Us</h1>
        <p className="text-sm font-light text-primary text-center mt-2">
          Get in touch with us. We'd like to talk with you.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-primary">
              Name
            </label>
            <div className="relative flex items-center text-black">
              <CiUser className="absolute left-3 h-5 w-5 text-black" />
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Zayd"
                autoComplete="off"
                className="w-full pl-10 py-2 focus:bg-white bg-muted text-black border border-light rounded-lg focus:ring-black focus:border-black focus:outline-none placeholder-black"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-primary">
              Email
            </label>
            <div className="relative flex items-center text-black">
              <MdOutlineEmail className="absolute left-3 h-5 w-5 text-black" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@any.com"
                autoComplete="off"
                className="w-full pl-10 py-2 focus:bg-white bg-muted text-black border border-light rounded-lg focus:ring-black focus:border-black focus:outline-none placeholder-black"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block mb-2 text-sm font-medium text-primary">
              Message
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Type your message, feedback, doubt etc."
              className="w-full bg-muted rounded-lg border border-light focus:border-black focus:bg-white focus:ring-black h-32 text-base outline-none text-black py-1 px-3 resize-none placeholder-black"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-light text-primary font-medium rounded-lg hover:bg-muted focus:ring-4 focus:ring-black"
          >
            {status === "loading" ? "Submitting..." : "Submit"}
          </button>

          {status === "success" && (
            <p className="mt-4 text-green-500 text-center">Message sent successfully! Redirecting...</p>
          )}
          {status === "error" && errorMessage && (
            <p className="mt-4 text-red-500 text-center">{errorMessage}</p>
          )}
          <div className="p-2 w-full pt-3 mt-3 border-t border-primary text-center">
              <a className="text-muted">masapmsawafy@gmail.com</a>
              <p className="text-primary my-2">
                PMSA Wafy college
                <br />
                Kattilangadi,Athavanadu,Kurumbathur Kerala 676301
              </p>
              <span className="inline-flex text-primary">
                <a className="hover:text-muted"
                    href="https://www.instagram.com/wafypmsa_official/">
                  <BsInstagram size={24} />
                </a>
                <a className="ml-4 hover:text-muted"
                    href="https://www.facebook.com/pmsawafy">
                  <BsFacebook size={24} />
                </a>
                <a className="ml-4 hover:text-muted"
                    href="https://www.youtube.com/@munthajulafnanstudentsasso6980">
                  <BsYoutube size={24} />
                </a>
                <a className="ml-4 hover:text-muted"
                    href="https://whatsapp.com/channel/0029Vb2AqUCIyPtPC9Tedu3m">
                  <BsWhatsapp size={24} />
                </a>
              </span>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
