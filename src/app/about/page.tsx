import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">About Atrium Jazz</h1>
      
      <div className="prose max-w-none">
        <p className="mb-4">
          There is an abundance of great jazz music in New York City. Our mission is to help you connect with it.
        </p>
        
        <p className="mb-4">
          Listings are updated weekly. If you&apos;d like your club or event to be added, please email us at <a href="mailto:info@atriumjazz.com" className="text-blue-300 hover:underline ml-1">info@atriumjazz.com</a>.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">Our Story</h2>
        <p className="mb-4">
          Founded and built for the love of music.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">Contact Us</h2>
        <p>
          Questions or suggestions? We&apos;d love to hear from you! Write us at 
          <a href="mailto:info@atriumjazz.com" className="text-blue-300 hover:underline ml-1">
            info@atriumjazz.com
          </a>.
        </p>
      </div>
    </div>
  );
} 