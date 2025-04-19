import React, { useRef, useState, useEffect } from 'react';
import CloseIcon from '../icons/CloseIcon';


interface JsonModalProps {
  data: any;
  onClose: () => void;
  onSave?: (newData: any) => void;
}

interface RequiredPersonFields {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  fatherId: string | null;
  motherId: string | null;
  photoUrl: string;
}

const JsonModal: React.FC<JsonModalProps> = ({ data, onClose, onSave }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      textarea.scrollTop += e.deltaY;
    };

    textarea.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      textarea.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const validateRequiredFields = (data: any): boolean => {
    const requiredFields: (keyof RequiredPersonFields)[] = [
      'id', 'lastName', 'firstName', 'middleName', 
      'birthDate', 'photoUrl'
    ];

    const missingFields = requiredFields.filter(field => {
      const value = data[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      setJsonError(`Отсутствуют обязательные поля: ${missingFields.join(', ')}`);
      return false;
    }

    return true;
  };

  const completeMissingFields = (data: any): any => {
    const defaultValues = {
      fatherId: null,
      motherId: null,
      deathDate: null,
      description: '',
      additionalPhotos: []
    };

    return {
      ...defaultValues,
      ...data
    };
  };

  const validateJson = (jsonString: string): boolean => {
    try {
      const parsedData = JSON.parse(jsonString);
      if (!validateRequiredFields(parsedData)) return false;
      return true;
    } catch (error) {
      if (error instanceof Error) {
        setJsonError(`Ошибка JSON: ${error.message}`);
      } else {
        setJsonError('Неверный формат JSON');
      }
      return false;
    }
  };

  const handleSave = () => {
    if (!textareaRef.current || !onSave) return;
    
    const jsonString = textareaRef.current.value;
    if (!validateJson(jsonString)) return;

    try {
      const newData = completeMissingFields(JSON.parse(jsonString));
      setJsonError(null);
      onSave(newData);
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        setJsonError(`Ошибка JSON: ${error.message}`);
      } else {
        setJsonError('Неверный формат JSON');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-lg p-6 w-[80vw] h-[80vh] mx-auto overflow-hidden flex flex-col">
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <div 
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={onClose}
          >
            <CloseIcon className="w-6 h-6" />
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-gray-50 p-4 mr-8 rounded-lg">
          <textarea
            ref={textareaRef}
            className="w-full h-full font-mono text-sm bg-transparent border-none outline-none resize-none overflow-auto"
            defaultValue={JSON.stringify(data, null, 2)}
            spellCheck="false"
            style={{ 
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              tabSize: 2
            }}
          />
        </div>
        
        {/* Кнопки и сообщение об ошибке */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex-1">
            {jsonError && (
              <p className="text-red-500 text-sm font-medium">{jsonError}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
              onClick={onClose}
            >
              Отмена
            </button>
            <button
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-black rounded-md text-sm font-medium"
              onClick={handleSave}
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonModal; 