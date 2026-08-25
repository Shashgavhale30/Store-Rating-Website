import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-base font-sans overflow-hidden relative">

      {/* Navigation */}
      <nav className="w-full px-8 py-6 flex justify-between items-center glass-panel sticky top-0 z-50">
        <div className="text-2xl font-bold text-primary tracking-tight">
          Store<span className="text-accent">Rating</span>
        </div>
        <div className="space-x-4 flex items-center">
          <Link 
            to="/login" 
            className="text-primary hover:text-accent font-semibold transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="bg-accent text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-700 transition-colors duration-200"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 flex flex-col items-center text-center mt-12">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-md bg-white text-gray-700 font-semibold text-sm tracking-wide shadow-sm border border-gray-200">
          Discover. Rate. Support Local.
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-primary tracking-tight leading-tight mb-8">
          Find the best stores <br className="hidden md:block"/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            in your neighborhood
          </span>
        </h1>
        
        <p className="mt-4 text-xl md:text-2xl text-gray-700 max-w-3xl mb-12 font-medium leading-relaxed">
          Join our community to discover hidden gems, share your experiences, and help others make informed decisions. Authentic ratings from real people.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 w-full justify-center max-w-lg">
          <Link 
            to="/register" 
            className="flex-1 bg-accent text-white text-lg font-semibold px-8 py-3 rounded-md shadow-sm hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 group"
          >
            Get Started
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </Link>
          <Link 
            to="/login" 
            className="flex-1 bg-white text-gray-800 text-lg font-semibold px-8 py-3 rounded-md shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
          >
            I have an account
          </Link>
        </div>
      </main>
      
      {/* Decorative Image/Feature Mockup Section */}
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 md:p-8 relative overflow-hidden group">
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                 <div className="w-16 h-16 mx-auto bg-gray-100 text-gray-800 rounded-lg flex items-center justify-center text-2xl mb-4">🌟</div>
                 <h3 className="text-xl font-semibold text-primary mb-2">Honest Reviews</h3>
                 <p className="text-gray-600">Verified ratings from real customers in your community.</p>
              </div>
              <div className="text-center p-6">
                 <div className="w-16 h-16 mx-auto bg-gray-100 text-gray-800 rounded-lg flex items-center justify-center text-2xl mb-4">🏪</div>
                 <h3 className="text-xl font-semibold text-primary mb-2">Store Owners</h3>
                 <p className="text-gray-600">Claim your store, monitor feedback, and grow your business.</p>
              </div>
              <div className="text-center p-6">
                 <div className="w-16 h-16 mx-auto bg-gray-100 text-gray-800 rounded-lg flex items-center justify-center text-2xl mb-4">📍</div>
                 <h3 className="text-xl font-semibold text-primary mb-2">Local Discovery</h3>
                 <p className="text-gray-600">Search by location and find top-rated shops near you.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
