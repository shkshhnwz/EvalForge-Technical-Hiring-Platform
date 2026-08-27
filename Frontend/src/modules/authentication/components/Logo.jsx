import React from 'react';

const Logo = ({ className = '', width = 48, height = 48 }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background Shield/Forge shape */}
    <path 
      d="M12 2L3 6V11C3 16.5 7 21 12 23C17 21 21 16.5 21 11V6L12 2Z" 
      fill="#ffffff" 
    />
    
    {/* Inner Code Brackets */}
    <path 
      d="M9.5 15L6 11.5L9.5 8" 
      stroke="#121517" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M14.5 15L18 11.5L14.5 8" 
      stroke="#121517" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    
    {/* Center Anvil / Node */}
    <rect x="10.5" y="10" width="3" height="3" rx="1" fill="#121517" />
    <path 
      d="M10 13H14V14.5C14 15.3284 13.3284 16 12.5 16H11.5C10.6716 16 10 15.3284 10 14.5V13Z" 
      fill="#121517"
    />
  </svg>
);

export default Logo;
