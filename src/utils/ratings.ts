import { Rating } from '../types';

/**
 * Calcula el promedio de calificaciones de una receta.
 */
export const calculateAverageRating = (ratings: Rating[]): number => {
  if (!ratings.length) {
    return 0;
  }

  const sum = ratings.reduce((accumulator, rating) => accumulator + rating.value, 0);
  return Number((sum / ratings.length).toFixed(1));
};