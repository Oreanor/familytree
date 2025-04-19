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