import { BsFacebook, BsInstagram, BsYoutube } from "react-icons/bs";

export default function Footer() {
  return (
    <footer className="bg-[#F0EAD2]">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="mt-4 py-5 border-t border-[#DDE5B6] flex items-center justify-between sm:flex-row flex-col">
          <p className="text-[#6C584C]">
            © 2024 PMSA. All rights reserved.
          </p>
          <div className="flex items-center gap-x-6 text-[#6C584C] mt-3 sm:mt-0">
            <a
              href="https://www.instagram.com/wafypmsa_official/"
              className="hover:text-[#ADC178] transition duration-150"
            >
              <BsInstagram size={24} />
            </a>
            <a
              href="https://www.facebook.com/pmsawafy"
              className="hover:text-[#ADC178] transition duration-150"
            >
              <BsFacebook size={24} />
            </a>
            <a
              href="https://www.youtube.com/@munthajulafnanstudentsasso6980"
              className="hover:text-[#ADC178] transition duration-150"
            >
              <BsYoutube size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
