import { Person, ProcessedPerson, CardPosition } from '../types/person';

/**
 * Форматирует имя в формате "Фамилия И.О." (с инициалами)
 */
export const formatNameWithInitials = (lastName: string, firstName: string, middleName: string): string => {
  const firstNameInitial = firstName ? firstName.charAt(0) + '.' : '';
  const middleNameInitial = middleName ? middleName.charAt(0) + '.' : '';
  return `${lastName} ${firstNameInitial} ${middleNameInitial}`.trim();
};

/**
 * Форматирует полное имя
 */
export const formatFullName = (lastName: string, firstName: string, middleName: string): string => {
  return `${lastName} ${firstName} ${middleName}`.trim();
};

/**
 * Находит максимальный уровень в дереве
 */
export const getMaxLevel = (person: ProcessedPerson): number => {
  let maxLevel = 0;
  
  const traverse = (currentPerson: ProcessedPerson, level: number) => {
    maxLevel = Math.max(maxLevel, level);
    
    if (currentPerson.father) {
      traverse(currentPerson.father, level + 1);
    }
    if (currentPerson.mother) {
      traverse(currentPerson.mother, level + 1);
    }
  };
  
  traverse(person, 0);
  return maxLevel;
};

/**
 * Обрабатывает данные о человеке, добавляя связи с родителями
 */
export const processPerson = (id: string, data: Person[]): ProcessedPerson | null => {
  const person = data.find(p => p.id === id);
  if (!person) return null;

  const processedPerson: ProcessedPerson = {
    ...person,
    father: undefined,
    mother: undefined
  };

  if (person.fatherId) {
    const father = processPerson(person.fatherId, data);
    if (father) {
      processedPerson.father = father;
    }
  }

  if (person.motherId) {
    const mother = processPerson(person.motherId, data);
    if (mother) {
      processedPerson.mother = mother;
    }
  }

  return processedPerson;
};

/**
 * Рассчитывает начальные позиции для карточек в дереве
 */
export const calculateInitialPositions = (
  person: ProcessedPerson,
  level: number,
  isMother: boolean,
  offsetX: number,
  isRight: boolean,
  maxLevel: number
): CardPosition[] => {
  const positions: CardPosition[] = [];
  const verticalSpacing = 300;
  const horizontalSpacing = 200;
  
  // Добавляем текущую карточку
  positions.push({
    person,
    x: offsetX,
    y: level * verticalSpacing,
    relationship: isMother ? 'Мать' : 'Отец',
    level
  });
  
  // Рекурсивно добавляем родителей
  if (person.father) {
    const fatherOffset = isRight ? offsetX + horizontalSpacing : offsetX - horizontalSpacing;
    positions.push(...calculateInitialPositions(
      person.father,
      level + 1,
      false,
      fatherOffset,
      isRight,
      maxLevel
    ));
  }
  
  if (person.mother) {
    const motherOffset = isRight ? offsetX + horizontalSpacing : offsetX - horizontalSpacing;
    positions.push(...calculateInitialPositions(
      person.mother,
      level + 1,
      true,
      motherOffset,
      isRight,
      maxLevel
    ));
  }
  
  return positions;
}; 