import { ProcessedPerson, CardPosition, Person } from '../types/person';
import { getRelationship } from './familyUtils';

/**
 * Обрабатывает данные о человеке, преобразуя их в формат ProcessedPerson
 */
export const processPerson = (personId: string, data: Person[]): ProcessedPerson | undefined => {
  const person = data.find((p) => p.id === personId);
  if (!person || !person.birthDate) return undefined;
  
  return {
    id: person.id,
    lastName: person.lastName,
    firstName: person.firstName,
    middleName: person.middleName,
    birthDate: person.birthDate,
    deathDate: person.deathDate,
    fatherId: person.fatherId,
    motherId: person.motherId,
    photoUrl: person.photoUrl,
    description: person.description,
    additionalPhotos: person.additionalPhotos,
    yearsOfLife: formatYearsOfLife(person.birthDate, person.deathDate || undefined),
    father: person.fatherId ? processPerson(person.fatherId, data) : undefined,
    mother: person.motherId ? processPerson(person.motherId, data) : undefined
  };
};

/**
 * Форматирует годы жизни человека
 */
export const formatYearsOfLife = (birth: string, death?: string): string => {
  const birthYear = birth.split('-')[0];
  const deathYear = death ? death.split('-')[0] : '';
  return deathYear ? `${birthYear}-${deathYear}` : birthYear;
};

/**
 * Вычисляет начальные позиции для карточек в дереве
 */
export const calculateInitialPositions = (
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