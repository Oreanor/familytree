import React, { useState } from 'react';
import { CloseIcon, UserIcon, PhotoIcon } from '../icons';
import { PersonModalProps } from '../types/person';

const PersonModal: React.FC<PersonModalProps> = ({ person, onClose }) => {
  const [mainPhoto, setMainPhoto] = useState<string | undefined>(person.photoUrl);

  const handlePhotoClick = (photoUrl: string) => {
    console.log("Клик по фото:", photoUrl);
    console.log("Текущий человек:", person.name);
    setMainPhoto(photoUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Полупрозрачный фон */}
      <div 
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      
      {/* Модальное окно */}
      <div className="relative bg-white rounded-lg p-8 w-[90vw] h-[85vh] max-w-6xl mx-auto overflow-hidden flex flex-col">
        {/* Кнопка закрытия */}
        <div 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 cursor-pointer"
          onClick={onClose}
        >
          <CloseIcon className="w-6 h-6" />
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="flex flex-col md:flex-row gap-8 h-full">
            {/* Основная информация и фото */}
            <div className="md:w-3/4 flex flex-col">
              <h2 className="text-3xl font-bold mb-2 text-left">{person.name}</h2>
              <p className="text-gray-600 mb-3 text-xl text-left">{person.yearsOfLife}</p>
              {person.description && (
                <div className="mb-6">
                  <p className="text-gray-700 whitespace-pre-line text-lg text-left">{person.description}</p>
                </div>
              )}
              <div className="mb-6 flex-1">
                {mainPhoto ? (
                  <img 
                    src={mainPhoto} 
                    alt={person.name} 
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-full h-full bg-gray-200 rounded-lg flex items-center justify-center';
                        const userIcon = document.createElement('div');
                        userIcon.innerHTML = `<svg class="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`;
                        placeholder.appendChild(userIcon);
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-32 h-32 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Дополнительные фото */}
            {person.additionalPhotos && person.additionalPhotos.length > 0 && (
              <div className="md:w-1/4">
                <h3 className="text-xl font-semibold mb-4 text-left">Дополнительные фото</h3>
                <div className="grid grid-cols-1 gap-4">
                  {person.additionalPhotos.map((photo, index) => (
                    <div 
                      key={index} 
                      className={`relative border-4 ${mainPhoto === photo.url ? 'border-blue-500' : 'border-transparent'} rounded-lg`}
                      onClick={() => handlePhotoClick(photo.url)}
                    >
                      <img 
                        src={photo.url} 
                        alt={photo.caption || `Фото ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center';
                            const photoIcon = document.createElement('div');
                            photoIcon.innerHTML = `<svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`;
                            placeholder.appendChild(photoIcon);
                            parent.appendChild(placeholder);
                          }
                        }}
                      />
                      {photo.caption && (
                        <p className="text-sm text-gray-600 mt-2 truncate text-left">{photo.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonModal; 