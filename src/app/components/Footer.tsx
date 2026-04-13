import React from "react";
import Link from "next/link";

const Footer: React.FC = () => (
    <footer className="w-full bg-white shadow-sm dark:bg-gray-900">
        <div className="w-full p-4 md:py-8">
            <div className="sm:flex sm:items-center sm:justify-between">
                <a
                    href="https://flowbite.com/"
                    className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
                >
                    <img
            src="/image/logo_black-removebg-preview.png"
            className="h-9 sm:h-14 md:h-[60px]"
            alt="Logo"
          />
                    <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-yellow-500">
                        BuriThaiTeam
                    </span>
                </a>
                <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-yellow-500 sm:mb-0 dark:text-yellow-500">
                    <li>
                        <Link href="/about" className="hover:underline me-4 md:me-6">
                            <span>About</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/privacy" className="hover:underline me-4 md:me-6">
                            <span>Privacy Policy</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/licensing" className="hover:underline me-4 md:me-6">
                            <span>Licensing</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/contact" className="hover:underline">
                            <span>Contact</span>
                        </Link>
                    </li>
                </ul>
            </div>
            <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
            <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
                © 2023{" "}
                <a href="https://flowbite.com/" className="hover:underline">
                    Flowbite™
                </a>
                . All Rights Reserved.
            </span>
        </div>
    </footer>
);

export default Footer;
