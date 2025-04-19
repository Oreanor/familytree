import React, { useState, useRef, useEffect, useMemo } from 'react';
import Card from './Card';
import PersonModal from './PersonModal';
import JsonModal from './JsonModal';
import data from '../data/family-tree.json'
import { Person, ProcessedPerson, CardPosition } from '../types/person';
import { getMaxLevel } from '../utils/familyUtils';
import { processPerson, calculateInitialPositions } from '../utils/treeUtils';

const FamilyTree: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardPositions, setCardPositions] = useState<CardPosition[]>([]);
  const [scale, setScale] = useState(0.35);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [offsetX, setOffsetX] = useState(800);
  const [offsetY, setOffsetY] = useState(200);
  const [selectedPerson, setSelectedPerson] = useState<ProcessedPerson | null>(null);
  const [showJsonModal, setShowJsonModal] = useState(false);

  // Кэшируем обработку данных с помощью useMemo
  const processedData = useMemo(() => {
    const result = (data as Person[]).filter((person) => person.id === "1").map(person => {
      return processPerson(person.id, data as Person[]);
    }).filter(Boolean) as ProcessedPerson[];
    return result;
  }, [data]);

  // Кэшируем расчет позиций карточек с помощью useMemo
  const calculatedPositions = useMemo(() => {
    console.log("Расчет позиций...");
    if (processedData.length === 0) return [];
    
    const result = processedData.flatMap((processedPerson) => {
      // Определяем максимальный уровень в дереве
      const maxLevel = getMaxLevel(processedPerson);
      console.log("Максимальный уровень:", maxLevel);
      
      const centerPositions = [{
        person: processedPerson,
        x: 0,
        y: maxLevel * 300, // maxLevel * verticalSpacing
        relationship: 'Вы',
        level: 0
      }];

      // Добавляем родителей
      if (processedPerson.father) {
        const fatherTree = calculateInitialPositions(processedPerson.father, 1, false, 0, false, maxLevel);
        centerPositions.push(...fatherTree);
      }
      if (processedPerson.mother) {
        const motherTree = calculateInitialPositions(processedPerson.mother, 1, true, 0, true, maxLevel);
        centerPositions.push(...motherTree);
      }

      return centerPositions;
    });
    console.log("Рассчитанные позиции:", result);
    return result;
  }, [processedData]);

  useEffect(() => {
    setCardPositions(calculatedPositions);
  }, [calculatedPositions]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(prevScale => Math.min(Math.max(prevScale * delta, 0.2), 2));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Кэшируем обработчики событий с помощью useMemo
  const handleMouseDown = useMemo(() => (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setStartX(e.clientX - offsetX);
      setStartY(e.clientY - offsetY);
    }
  }, [offsetX, offsetY]);

  const handleMouseMove = useMemo(() => (e: React.MouseEvent) => {
    if (isDragging) {
      setOffsetX(e.clientX - startX);
      setOffsetY(e.clientY - startY);
    }
  }, [isDragging, startX, startY]);

  const handleMouseUp = useMemo(() => () => {
    setIsDragging(false);
  }, []);

  // Кэшируем стили контейнера с помощью useMemo
  const containerStyle = useMemo(() => ({
    transform: `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`,
    transformOrigin: 'center center',
    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
  }), [scale, offsetX, offsetY, isDragging]);

  const handleCardClick = (person: ProcessedPerson) => {
    // Находим полную информацию о человеке в исходных данных
    const fullPersonData = (data as Person[]).find(p => p.id === person.id);
    if (fullPersonData) {
      setSelectedPerson({
        ...person,
        description: fullPersonData.description,
        additionalPhotos: fullPersonData.additionalPhotos
      });
    } else {
      setSelectedPerson(person);
    }
  };

  const handleCloseModal = () => {
    setSelectedPerson(null);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-gray-100"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="relative w-full h-full"
        style={containerStyle}
      >
        <svg 
          className="absolute pointer-events-none"
          style={{
            width: '6000px',
            height: '3000px',
            left: '-2500px',
            top: '-1000px'
          }}
          viewBox="-2500 -1000 6000 3000"
        >
          {cardPositions.map((childCard, index) => {
            const fatherCard = cardPositions.find(p => p.person === childCard.person.father);
            const motherCard = cardPositions.find(p => p.person === childCard.person.mother);

            // const cardWidth = 160; // Ширина карточки
            const cardHeight = 192; // Высота карточки

            // Точка начала линии - центр верхней границы карточки потомка минус половина ширины карточки
            const childX = childCard.x;
            const childY = childCard.y - cardHeight/2;

            return (
              <React.Fragment key={`lines-${childCard.person.lastName}-${childCard.person.firstName}-${index}`}>
                {fatherCard && (
                  <line
                    key={`line-${childCard.person.lastName}-${childCard.person.firstName}-father-${index}`}
                    x1={childX}
                    y1={childY}
                    x2={fatherCard.x}
                    y2={fatherCard.y + cardHeight/2}
                    stroke="#475569"
                    strokeWidth="3"
                    strokeDasharray="8,8"
                    opacity="0.8"
                  />
                )}
                {motherCard && (
                  <line
                    key={`line-${childCard.person.lastName}-${childCard.person.firstName}-mother-${index}`}
                    x1={childX}
                    y1={childY}
                    x2={motherCard.x}
                    y2={motherCard.y + cardHeight/2}
                    stroke="#475569"
                    strokeWidth="3"
                    strokeDasharray="8,8"
                    opacity="0.8"
                  />
                )}
              </React.Fragment>
            );
          })}
        </svg>

        {/* Карточки */}
        <div className="relative z-10 h-full">
          {cardPositions.map((card, index) => (
            <Card
              key={`${card.person.lastName}-${card.person.firstName}-${index}`}
              name={`${card.person.lastName} ${card.person.firstName} ${card.person.middleName}`.trim()}
              yearsOfLife={card.person.yearsOfLife}
              photoUrl={card.person.photoUrl}
              relationship={card.relationship}
              defaultPosition={{ x: card.x, y: card.y }}
              onClick={() => handleCardClick(card.person)}
            />
          ))}
        </div>
      </div>

      {/* Модальное окно */}
      {selectedPerson && (
        <PersonModal
          person={selectedPerson}
          onClose={handleCloseModal}
        />
      )}

      {/* Кнопка JSON в углу экрана */}
      <button
        className="fixed top-4 right-4 z-[70] text-gray-500 hover:text-gray-700 cursor-pointer bg-white hover:bg-gray-100 px-3 py-1 rounded-md text-sm font-medium shadow-md"
        onClick={() => setShowJsonModal(true)}
      >
        JSON
      </button>

      {/* JSON модалка */}
      {showJsonModal && (
        <JsonModal
          data={selectedPerson ? (data as Person[]).find(p => p.id === selectedPerson.id) : data}
          onClose={() => setShowJsonModal(false)}
          onSave={(newData) => {
            // Обновляем данные и пересчитываем позиции
            const updatedData = selectedPerson 
              ? (data as Person[]).map(person => person.id === selectedPerson.id ? newData : person)
              : newData as Person[];
            
            // Здесь можно добавить логику для сохранения данных
            
            // Обновляем данные выбранного человека в модалке
            if (selectedPerson) {
              const updatedPerson = processedData.find(p => p.id === selectedPerson.id);
              if (updatedPerson) {
                const fullPersonData = updatedData.find(p => p.id === selectedPerson.id);
                setSelectedPerson({
                  ...updatedPerson,
                  description: fullPersonData?.description || '',
                  additionalPhotos: fullPersonData?.additionalPhotos || []
                });
              }
            }
            
            setShowJsonModal(false);
          }}
        />
      )}
    </div>
  );
};

export default FamilyTree;