/**
 * Возвращает название родственной связи на основе уровня и пола
 * @param level Уровень в генеалогическом дереве (0 - текущий человек, 1 - родители, 2 - бабушки/дедушки и т.д.)
 * @param isFather Флаг, указывающий, является ли родственник отцом (true) или матерью (false)
 * @returns Название родственной связи с заглавной буквы
 */
export const getRelationship = (level: number, isFather: boolean): string => {
  // Базовые случаи
  if (level === 0) return 'Вы';
  if (level === 1) return isFather ? 'Отец' : 'Мать';
  if (level === 2) return isFather ? 'Дедушка' : 'Бабушка';
  
  // Для уровней 3 и выше добавляем нужное количество "пра"
  const praCount = level - 2; 
  const praPrefix = 'пра'.repeat(praCount);
  const baseTerm = isFather ? 'дедушка' : 'бабушка';

  const result = praPrefix + baseTerm;
  return result.charAt(0).toUpperCase() + result.slice(1);
}; 

/**
 * Форматирует годы жизни человека
 * @param birth Дата рождения в формате YYYY-MM-DD или YYYY
 * @param death Дата смерти в формате YYYY-MM-DD или YYYY (опционально)
 * @returns Отформатированная строка с годами жизни
 */
export const formatYearsOfLife = (birth: string, death?: string): string => {
  const birthYear = birth.split('-')[0];
  const deathYear = death ? death.split('-')[0] : '';
  return deathYear ? `${birthYear}-${deathYear}` : birthYear;
}; 

/**
 * Определяет максимальный уровень в генеалогическом дереве
 * @param person Обработанный объект человека
 * @param currentLevel Текущий уровень в дереве (по умолчанию 0)
 * @returns Максимальный уровень в дереве
 */
export const getMaxLevel = (person: any, currentLevel: number = 0): number => {
  let maxLevel = currentLevel;
  
  if (person.father) {
    maxLevel = Math.max(maxLevel, getMaxLevel(person.father, currentLevel + 1));
  }
  
  if (person.mother) {
    maxLevel = Math.max(maxLevel, getMaxLevel(person.mother, currentLevel + 1));
  }
  
  return maxLevel;
}; 