import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#1a1a1a] text-white py-8 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; 2023 Your E-commerce Store. All rights reserved.</p>
        <div className="mt-4">
          <a href="#" className="text-gray-400 hover:text-white mx-2">Privacy Policy</a>
          <span className="text-gray-500">|</span>
          <a href="#" className="text-gray-400 hover:text-white mx-2">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 