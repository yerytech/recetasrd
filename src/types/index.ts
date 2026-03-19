/**
 * Tipos principales del dominio de Recetas RD.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
}

export interface Comment {
  id: string;
  recipeId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Rating {
  id: string;
  recipeId: string;
  userId: string;
  value: number;
  createdAt: string;
}

export interface Recipe {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  ingredients: Ingredient[];
  preparation: string;
  authorId: string;
  averageRating: number;
  ratingsCount: number;
  comments: Comment[];
  createdAt: string;
}

export interface ShoppingItem extends Ingredient {
  completed: boolean;
  recipeId: string;
  recipeTitle: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  name: string;
}