import React from 'react';

interface CloseIconProps {
  className?: string;
  size?: number;
}

const CloseIcon: React.FC<CloseIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M6 18L18 6M6 6l12 12" 
      />
    </svg>
  );
};

export default CloseIcon; 