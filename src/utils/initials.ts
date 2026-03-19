/**
 * Obtiene iniciales desde un nombre completo.
 */
export const getInitials = (fullName: string): string => {
  const parts = fullName
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return 'U';
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
};