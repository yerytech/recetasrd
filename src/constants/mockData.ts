import { Comment, Rating, Recipe, User } from '../types';
import { calculateAverageRating } from '../utils/ratings';

/**
 * Datos de respaldo para desarrollo cuando Supabase no está configurado.
 */

const BASE_RECIPES: Omit<Recipe, 'averageRating' | 'ratingsCount' | 'comments'>[] = [
  {
    id: 'receta-1',
    title: 'Mangú con los Tres Golpes',
    category: 'Desayuno',
    imageUrl:
      'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1200&q=80',
    ingredients: [
      { id: 'ing-1', name: 'Plátanos verdes', quantity: '3 unidades' },
      { id: 'ing-2', name: 'Salami', quantity: '200 g' },
      { id: 'ing-3', name: 'Queso frito', quantity: '150 g' },
      { id: 'ing-4', name: 'Huevos', quantity: '2 unidades' },
      { id: 'ing-5', name: 'Cebolla roja', quantity: '1 unidad' },
    ],
    preparation:
      'Hierve los plátanos hasta que estén blandos y machácalos con un poco de agua de cocción. Fríe el salami, el queso y los huevos por separado. Sofríe la cebolla con vinagre y sirve todo junto.',
    authorId: 'user-1',
    createdAt: '2026-03-01T14:00:00.000Z',
  },
  {
    id: 'receta-2',
    title: 'Sancocho Dominicano',
    category: 'Almuerzo',
    imageUrl:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
    ingredients: [
      { id: 'ing-6', name: 'Carne de res', quantity: '400 g' },
      { id: 'ing-7', name: 'Pollo', quantity: '400 g' },
      { id: 'ing-8', name: 'Yuca', quantity: '300 g' },
      { id: 'ing-9', name: 'Auyama', quantity: '250 g' },
      { id: 'ing-10', name: 'Cilantro', quantity: '1 manojo' },
    ],
    preparation:
      'Sella las carnes en una olla grande. Agrega agua y deja cocinar a fuego medio. Incorpora los víveres en orden de dureza y sazona. Cocina hasta obtener un caldo espeso y sabroso.',
    authorId: 'user-2',
    createdAt: '2026-03-02T15:30:00.000Z',
  },
  {
    id: 'receta-3',
    title: 'Pollo Guisado Criollo',
    category: 'Cena',
    imageUrl:
      'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=1200&q=80',
    ingredients: [
      { id: 'ing-11', name: 'Pollo troceado', quantity: '1 kg' },
      { id: 'ing-12', name: 'Salsa de tomate', quantity: '4 cdas' },
      { id: 'ing-13', name: 'Ajo', quantity: '3 dientes' },
      { id: 'ing-14', name: 'Pimiento', quantity: '1 unidad' },
      { id: 'ing-15', name: 'Orégano', quantity: '1 cdita' },
    ],
    preparation:
      'Marina el pollo con ajo, orégano y sal. Dora en aceite caliente, agrega vegetales y salsa de tomate. Añade agua y cocina tapado hasta que el pollo esté tierno y la salsa reduzca.',
    authorId: 'user-1',
    createdAt: '2026-03-03T12:30:00.000Z',
  },
  {
    id: 'receta-4',
    title: 'Habichuelas con Dulce',
    category: 'Postres',
    imageUrl:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80',
    ingredients: [
      { id: 'ing-16', name: 'Habichuelas rojas', quantity: '500 g' },
      { id: 'ing-17', name: 'Leche evaporada', quantity: '2 tazas' },
      { id: 'ing-18', name: 'Leche de coco', quantity: '1 taza' },
      { id: 'ing-19', name: 'Azúcar', quantity: '1 taza' },
      { id: 'ing-20', name: 'Canela', quantity: '2 ramas' },
    ],
    preparation:
      'Licúa las habichuelas cocidas y cuela la mezcla. Cocina con las leches, azúcar y especias a fuego medio hasta espesar. Sirve frío con galletitas de leche.',
    authorId: 'user-2',
    createdAt: '2026-03-04T10:30:00.000Z',
  },
];

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Ana Jiménez',
    email: 'ana@recetasrd.app',
    avatarUrl: null,
  },
  {
    id: 'user-2',
    name: 'Luis Peralta',
    email: 'luis@recetasrd.app',
    avatarUrl: null,
  },
];

export const MOCK_RATINGS: Rating[] = [
  {
    id: 'rating-1',
    recipeId: 'receta-1',
    userId: 'user-1',
    value: 5,
    createdAt: '2026-03-05T08:00:00.000Z',
  },
  {
    id: 'rating-2',
    recipeId: 'receta-1',
    userId: 'user-2',
    value: 4,
    createdAt: '2026-03-05T09:00:00.000Z',
  },
  {
    id: 'rating-3',
    recipeId: 'receta-2',
    userId: 'user-1',
    value: 5,
    createdAt: '2026-03-05T10:00:00.000Z',
  },
  {
    id: 'rating-4',
    recipeId: 'receta-3',
    userId: 'user-2',
    value: 4,
    createdAt: '2026-03-05T11:00:00.000Z',
  },
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'comment-1',
    recipeId: 'receta-1',
    userId: 'user-2',
    userName: 'Luis Peralta',
    content: 'Quedó delicioso, la cebolla encurtida le da el toque final.',
    createdAt: '2026-03-06T08:20:00.000Z',
  },
  {
    id: 'comment-2',
    recipeId: 'receta-2',
    userId: 'user-1',
    userName: 'Ana Jiménez',
    content: 'Excelente receta para compartir en familia los domingos.',
    createdAt: '2026-03-06T10:10:00.000Z',
  },
  {
    id: 'comment-3',
    recipeId: 'receta-4',
    userId: 'user-2',
    userName: 'Luis Peralta',
    content: 'Muy buena textura, me encantó bien fría.',
    createdAt: '2026-03-06T11:30:00.000Z',
  },
];

export const MOCK_RECIPES: Recipe[] = BASE_RECIPES.map((recipe) => {
  const ratings = MOCK_RATINGS.filter((rating) => rating.recipeId === recipe.id);
  const comments = MOCK_COMMENTS.filter((comment) => comment.recipeId === recipe.id);

  return {
    ...recipe,
    averageRating: calculateAverageRating(ratings),
    ratingsCount: ratings.length,
    comments,
  };
});