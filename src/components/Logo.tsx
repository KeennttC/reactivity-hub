import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center">
      <svg className="h-10 w-10 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="#0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="#0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="font-bold text-3xl text-cyan-300 font-tech-noir">TechHub</span>
    </Link>
  );
};

export default Logo;