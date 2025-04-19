import React, { useState, useRef } from 'react';

interface CardProps {
  name: string;
  yearsOfLife: string;
  photoUrl?: string;
  relationship: string;
  defaultPosition: { x: number; y: number };
  onClick?: () => void;
}

interface TooltipPosition {
  x: number;
  y: number;
}

const Card: React.FC<CardProps> = ({ name, yearsOfLife, photoUrl, relationship, defaultPosition, onClick }) => {
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Получаем позицию мыши относительно карточки
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTooltipPosition({ x, y });
  };

  return (
    <div
      ref={cardRef}
      className="card-container absolute"
      style={{
        left: defaultPosition.x - 80,
        top: defaultPosition.y - 96,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      <div className="w-40 h-48 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all duration-200 hover:border-gray-400 hover:shadow-md cursor-pointer">
        <div className="h-32 overflow-hidden">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const placeholder = document.createElement('div');
                  placeholder.className = 'w-full h-full bg-gray-200 flex items-center justify-center';
                  placeholder.innerHTML = `
                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  `;
                  parent.appendChild(placeholder);
                }
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-2">
          <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
          <p className="text-xs text-gray-500">{yearsOfLife}</p>
        </div>
      </div>
      {showTooltip && tooltipPosition && (
        <div
          className="absolute bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y - 25,
            zIndex: 50,
            pointerEvents: 'none'
          }}
        >
          {relationship}
        </div>
      )}
    </div>
  );
};

export default Card; 