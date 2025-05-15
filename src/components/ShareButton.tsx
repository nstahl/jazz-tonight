import React from 'react';
import ReactDOM from 'react-dom';
import { Fugaz_One } from 'next/font/google';

const fugazOne = Fugaz_One({
  weight: '400',
  subsets: ['latin'],
});

interface ShareButtonProps {
  url: string;
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

function ShareButton({ url, className = '', showIcon = true, showText = true }: ShareButtonProps) {
  const [showToast, setShowToast] = React.useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(url);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <>
      <button
        className={`flex items-center px-4 py-2 bg-blue-400 text-white rounded-lg shadow hover:bg-blue-300 transition cursor-pointer ${fugazOne.className} ${className}`}
        onClick={handleShare}
      >
        {showIcon && (
          <svg className="w-6 h-6 md:mr-1 -rotate-45 -mt-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
          </svg>
        )}
        {showText && <span className="hidden md:inline">Share</span>}
      </button>

      {showToast &&
        ReactDOM.createPortal(
          <div className="
          fixed 
          left-1/2 
          top-8 
          -translate-x-1/2 
          z-50 
          bg-blue-400 
          text-white 
          px-4 
          py-2 
          rounded-lg 
          shadow-lg 
          flex 
          items-center 
          gap-2 
          animate-fade-in-out 
          min-w-[300px] 
          justify-center">

            <div className="
            flex 
            flex-col 
            text-sm 
            text-center 
            leading-tight
            w-full
            gap-y-1
            items-center
            ">
              <span>Link copied to clipboard</span>
            </div>
          </div>,
          document.body
        )
      }
    </>
  );
}

export default ShareButton; 