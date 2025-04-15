'use client';

import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  return (
    <nav className="bg-black text-white py-6">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-4 lg:px-4 container mx-auto flex justify-between">
        <Link href="/" className="flex items-center space-x-2 cursor-pointer">
          <div>
            <Image
              src="/atrium.svg"
              alt="Atrium Jazz Logo"
              width={500}
              height={100}
              priority
              className="h-8 w-auto hover:opacity-80"
            />
          </div>
        </Link>
        <div className="space-x-8 flex items-center">
          <Link href="/about" className="hover:text-gray-300">
            About
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 