import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import CloseIcon from '../icons/CloseIcon';
import UserIcon from '../icons/UserIcon';
import PhotoIcon from '../icons/PhotoIcon';

interface PersonModalProps {
  person: {
    id: string;
    lastName: string;
    firstName: string;
    middleName: string;
    yearsOfLife: string;
    photoUrl?: string;
    description?: string;
    additionalPhotos?: Array<{
      url: string;
      caption: string;
    }>;
  };
  onClose: () => void;
}

const PersonModal: React.FC<PersonModalProps> = ({ person, onClose }) => {
  const [mainPhoto, setMainPhoto] = useState<string | undefined>(person.photoUrl);

  const handlePhotoClick = (photoUrl: string) => {
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
              <h2 className="text-3xl font-bold mb-2 text-left">{person.lastName} {person.firstName} {person.middleName}</h2>
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
                    alt={person.firstName} 
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-full h-full bg-gray-200 rounded-lg flex items-center justify-center';
                        parent.appendChild(placeholder);
                        const root = createRoot(placeholder);
                        root.render(<UserIcon size={64} />);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <UserIcon size={64} />
                  </div>
                )}
              </div>
            </div>
            
            {/* Дополнительные фото */}
            {person.additionalPhotos && person.additionalPhotos.length > 0 && (
              <div className="md:w-1/4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Основное фото как первая превьюшка */}
                  {person.photoUrl && (
                    <div className="relative">
                      <img 
                        src={person.photoUrl} 
                        alt="Основное фото" 
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handlePhotoClick(person.photoUrl!)}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center';
                            parent.appendChild(placeholder);
                            const root = createRoot(placeholder);
                            root.render(<PhotoIcon size={32} />);
                          }
                        }}
                      />
                      <p className="text-sm text-gray-600 mt-2 truncate text-left">Основное фото</p>
                    </div>
                  )}
                  {/* Остальные дополнительные фото */}
                  {person.additionalPhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={photo.url} 
                        alt={photo.caption || `Фото ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handlePhotoClick(photo.url)}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center';
                            parent.appendChild(placeholder);
                            const root = createRoot(placeholder);
                            root.render(<PhotoIcon size={32} />);
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