/**
 * Categorías mostradas en Home y filtros.
 */

export const RECIPE_CATEGORIES = ['Todas', 'Desayuno', 'Almuerzo', 'Cena', 'Postres'] as const;

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];