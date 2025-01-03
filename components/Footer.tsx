import { BsFacebook, BsInstagram, BsWhatsapp, BsYoutube } from "react-icons/bs";

export default function Footer() {
  return (
    <footer className="bg-secondary">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="mt-4 py-5 border-t border-accent flex items-center justify-between sm:flex-row flex-col">
          <p className="text-primary">
            © 2024 PMSA Kattilangadi. All rights reserved.
          </p>
          <div className="flex items-center gap-x-6 text-primary mt-3 sm:mt-0">
            <a
              href="https://www.instagram.com/wafypmsa_official/"
              className="hover:text-muted transition duration-150"
            >
              <BsInstagram size={24} />
            </a>
            <a
              href="https://www.facebook.com/pmsawafy"
              className="hover:text-muted transition duration-150"
            >
              <BsFacebook size={24} />
            </a>
            <a
              href="https://www.youtube.com/@munthajulafnanstudentsasso6980"
              className="hover:text-muted transition duration-150"
            >
              <BsYoutube size={24} />
            </a>
            <a
              href="https://whatsapp.com/channel/0029Vb2AqUCIyPtPC9Tedu3m"
              className="hover:text-muted transition duration-150"
            >
              <BsWhatsapp size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
