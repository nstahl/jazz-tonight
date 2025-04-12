'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Fugaz_One } from 'next/font/google';

const fugazOne = Fugaz_One({
  weight: '400',
  subsets: ['latin'],
});

const Navbar = () => {
  return (
    <nav className="bg-black text-white p-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
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
        <div className={`text-lg font-semibold ${fugazOne.className}`}>
          Jazz in NYC
        </div>
        <div className="space-x-8">
          <Link href="/" className="hover:text-gray-300">
            Home
          </Link>
          <Link href="/about" className="hover:text-gray-300">
            About
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 