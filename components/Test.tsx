import React from 'react';
import { CiHome, CiUser } from 'react-icons/ci';
import { MdOutlineEmail } from 'react-icons/md';
import { TbLockPassword } from 'react-icons/tb';

const SignupForm = () => {
  return (
    <div className="flex flex-col w-full md:w-1/2 xl:w-2/5 2xl:w-2/5 3xl:w-1/3 mx-auto p-8 md:p-10 2xl:p-12 3xl:p-14 bg-white rounded-2xl shadow-xl">
      <div className="flex flex-row gap-3 pb-4">
        <h1 className="text-3xl font-bold text-gray-600 my-auto">Islam on Web</h1>
      </div>
      <div className="text-sm font-light text-gray-500 pb-8">
        Sign up for an account on Your Company.
      </div>
      <form className="flex flex-col">
        <div className="pb-2">
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
            Name
          </label>
          <div className="relative text-gray-400">
            <span className="absolute inset-y-0 left-0 flex items-center p-1 pl-3">
            <CiUser/>
            </span>
            <input
              type="text"
              id="name"
              placeholder="Your Name"
              autoComplete="off"
              className="pl-12 mb-2 bg-gray-50 text-gray-600 border focus:border-transparent border-gray-300 sm:text-sm rounded-lg ring ring-transparent focus:ring-1 focus:outline-none focus:ring-gray-400 block w-full p-2.5 rounded-l-lg py-3 px-4"
            />
          </div>
        </div>
        <div className="pb-2">
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
            Place
          </label>
          <div className="relative text-gray-400">
            <span className="absolute inset-y-0 left-0 flex items-center p-1 pl-3">
            <CiHome/>
            </span>
            <input
              type="text"
              id="name"
              placeholder="Your Name"
              autoComplete="off"
              className="pl-12 mb-2 bg-gray-50 text-gray-600 border focus:border-transparent border-gray-300 sm:text-sm rounded-lg ring ring-transparent focus:ring-1 focus:outline-none focus:ring-gray-400 block w-full p-2.5 rounded-l-lg py-3 px-4"
            />
          </div>
        </div>
        <div className="pb-2">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
            Email
          </label>
          <div className="relative text-gray-400">
            <span className="absolute inset-y-0 left-0 flex items-center p-1 pl-3">
            <MdOutlineEmail/>
            </span>
            <input
              type="email"
              id="email"
              placeholder="name@company.com"
              autoComplete="off"
              className="pl-12 mb-2 bg-gray-50 text-gray-600 border focus:border-transparent border-gray-300 sm:text-sm rounded-lg ring ring-transparent focus:ring-1 focus:outline-none focus:ring-gray-400 block w-full p-2.5 rounded-l-lg py-3 px-4"
            />
          </div>
        </div>
        <div className="pb-6">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
            Password
          </label>
          <div className="relative text-gray-400">
            <span className="absolute inset-y-0 left-0 flex items-center p-1 pl-3">
            <TbLockPassword/>
            </span>
            <input
              type="password"
              id="password"
              placeholder="••••••••••"
              autoComplete="new-password"
              className="pl-12 mb-2 bg-gray-50 text-gray-600 border focus:border-transparent border-gray-300 sm:text-sm rounded-lg ring ring-transparent focus:ring-1 focus:outline-none focus:ring-gray-400 block w-full p-2.5 rounded-l-lg py-3 px-4"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full text-white bg-indigo-600 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-6"
        >
          Sign Up
        </button>
        <div className="text-sm font-light text-gray-500">
          Already have an account?{" "}
          <a href="#" className="font-medium text-indigo-600 hover:underline">
            Login
          </a>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
