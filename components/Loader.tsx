import Image from 'next/image';
import React from 'react';
import logo from '@/public/logo.png';
import pmsalogo from '@/public/pmsalogo.png';
import wafylogo from '@/public/wafylogo.png';

const Loader = () => {
  return (
    <div className="h-screen flex flex-col justify-between bg-primary text-center relative">
      {/* PMSA logo at the top with margin */}
      <div className="absolute top-6 w-full flex justify-center">
        <Image
          src={pmsalogo}
          alt="PMSA Logo"
          width={150}
          height={150}
          className="mx-auto"
        />
      </div>

      {/* Center content: hashtag and main logo */}
      <div className="flex flex-col items-center justify-center flex-grow">
        {/* Hashtag */}
        <h1 className="text-secondary font-bold text-2xl my-6">
          #must_try_6+5
        </h1>

        {/* Main logo */}
        <Image
          src={logo}
          alt="Logo"
          width={200}
          height={200}
          className="mx-auto"
        />
      </div>

      {/* Wafy Wafiyya Arts Fest logo at the bottom with margin */}
      <div className="absolute bottom-6 w-full flex justify-center">
        <Image
          src={wafylogo}
          alt="Wafy Wafiyya Logo"
          width={250}
          height={250}
          className="mx-auto"
        />
      </div>
    </div>
  );
};

export default Loader;
