import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">About Fractal Jazz</h1>
      
      <div className="prose max-w-none">
        <p className="mb-4">
          Fractal Jazz is your go-to resource for discovering the vibrant jazz scene in New York City.
          We curate and showcase nightly jazz events across the city, bringing together musicians and music lovers.
        </p>
        
        <p className="mb-4">
          Our mission is to connect jazz enthusiasts with the best live performances, from intimate club settings
          to grand concert halls. Whether you're a longtime jazz aficionado or just beginning to explore the genre,
          Fractal Jazz helps you find your next musical adventure.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">Our Story</h2>
        <p className="mb-4">
          Founded by a group of passionate jazz lovers, Fractal Jazz emerged from a simple idea: 
          to make it easier for people to discover and enjoy live jazz music in NYC. We believe that
          jazz is more than just music—it's a living, breathing art form that brings communities together.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-4">Contact Us</h2>
        <p>
          Have questions or suggestions? We'd love to hear from you! Reach out to us at 
          <a href="mailto:info@fractaljazz.com" className="text-blue-600 hover:underline ml-1">
            info@fractaljazz.com
          </a>
        </p>
      </div>
    </div>
  );
} 