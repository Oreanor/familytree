import React, { useState, useRef, useEffect, useMemo } from 'react';
import Card from './Card';
import PersonModal from './PersonModal';
import data from '../data/family-tree.json'
import { getRelationship, formatYearsOfLife, getMaxLevel } from '../utils/familyUtils';


interface Person {
  id: string;
  lastName?: string;
  firstName?: string;
  middleName?: string;
  birthDate?: string;
  deathDate?: string;
  fatherId?: string;
  motherId?: string;
  photoUrl?: string;
  description?: string;
  additionalPhotos?: Array<{
    url: string;
    caption: string;
  }>;
}

interface ProcessedPerson {
  id: string;
  name: string;
  yearsOfLife: string;
  photoUrl?: string;
  father?: ProcessedPerson;
  mother?: ProcessedPerson;
  description?: string;
  additionalPhotos?: Array<{
    url: string;
    caption: string;
  }>;
}

interface CardPosition {
  person: ProcessedPerson;
  x: number;
  y: number;
  relationship: string;
  level: number;
}

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

  // Перемещаем функцию processPerson перед useMemo
  const processPerson = (personId: string): ProcessedPerson | undefined => {
    const person = (data as any[]).find((p) => p.id === personId);
    if (!person || !person.birthDate) return undefined;
    
    // Форматируем имя как "Фамилия И.О."
    const lastName = person.lastName || '';
    const firstNameInitial = person.firstName ? person.firstName.charAt(0) + '.' : '';
    const middleNameInitial = person.middleName ? person.middleName.charAt(0) + '.' : '';
    const formattedName = `${lastName} ${firstNameInitial} ${middleNameInitial}`.trim();
    
    return {
      id: person.id,
      name: formattedName,
      yearsOfLife: formatYearsOfLife(person.birthDate, person.deathDate || undefined),
      photoUrl: person.photoUrl,
      father: person.fatherId ? processPerson(person.fatherId) : undefined,
      mother: person.motherId ? processPerson(person.motherId) : undefined
    };
  };

  // Кэшируем обработку данных с помощью useMemo
  const processedData = useMemo(() => {
    console.log("Обработка данных...");
    console.log(data);
    const result = (data as any[]).filter((person) => person.id === "1").map(person => {
      return processPerson(person.id);
    }).filter(Boolean) as ProcessedPerson[];
    console.log("Обработанные данные:", result);
    console.log("Обработанные данные длина:", result.length);
    return result;
  }, [data]);

  const calculateInitialPositions = (
    person: ProcessedPerson, 
    level: number = 0, 
    isMotherSide: boolean = false, 
    baseX: number = 0,
    isMother: boolean = false,
    maxLevel: number
  ): CardPosition[] => {
    const positions: CardPosition[] = [];
    const verticalSpacing = 300;
    // Увеличиваем ширину экрана для большего расстояния между карточками
    const screenWidth = 3000; // Было 2000
    const centerX = 0; // Центр экрана (позиция текущего человека)

    // Вычисляем вертикальную позицию
    const y = (maxLevel - level) * verticalSpacing;

    // Вычисляем горизонтальную позицию в зависимости от уровня
    let x = centerX; // По умолчанию в центре

    if (level === 0) {
      // Текущий человек всегда в центре
      x = centerX;
    } else {
      // Для уровней 1 и выше распределяем карточки равномерно
      const segments = Math.pow(2, level); // Количество сегментов на текущем уровне
      const segmentWidth = screenWidth / segments; // Ширина одного сегмента
      
      // Определяем индекс сегмента для текущей карточки
      let segmentIndex = 0;
      
      if (level === 1) {
        // Для родителей: отец в левом сегменте, мать в правом
        segmentIndex = isMother ? 1 : 0;
      } else {
        // Для более дальних предков используем baseX для определения сегмента
        const parentSegmentCount = Math.pow(2, level - 1);
        const parentSegmentWidth = screenWidth / parentSegmentCount;
        const parentSegmentIndex = Math.floor((baseX - centerX + screenWidth/2) / parentSegmentWidth);
        
        // Определяем, в каком из двух сегментов текущего уровня должна быть карточка
        const isRightChild = isMother;
        segmentIndex = parentSegmentIndex * 2 + (isRightChild ? 1 : 0);
      }
      
      // Вычисляем центр сегмента
      x = centerX - screenWidth/2 + segmentWidth * segmentIndex + segmentWidth/2;
    }

    positions.push({
      person,
      x,
      y,
      relationship: getRelationship(level, !isMother),
      level
    });

    if (person.father) {
      positions.push(...calculateInitialPositions(person.father, level + 1, isMotherSide, x, false, maxLevel));
    }
    if (person.mother) {
      positions.push(...calculateInitialPositions(person.mother, level + 1, isMotherSide, x, true, maxLevel));
    }

    return positions;
  };

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
    const fullPersonData = (data as any[]).find(p => p.id === person.id);
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

            const cardWidth = 160; // Ширина карточки
            const cardHeight = 192; // Высота карточки

            // Точка начала линии - центр верхней границы карточки потомка минус половина ширины карточки
            const childX = childCard.x;
            const childY = childCard.y - cardHeight/2;

            return (
              <React.Fragment key={`lines-${childCard.person.name}-${index}`}>
                {fatherCard && (
                  <line
                    key={`line-${childCard.person.name}-father-${index}`}
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
                    key={`line-${childCard.person.name}-mother-${index}`}
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
              key={`${card.person.name}-${index}`}
              name={card.person.name}
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
    </div>
  );
};

export default FamilyTree;