/**
 * Formatea una fecha ISO a un texto corto en español.
 */
export const formatDateToSpanish = (dateIso: string): string => {
  const date = new Date(dateIso);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('es-DO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};