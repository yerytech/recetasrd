/**
 * Tipos de rutas para navegación.
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { LocationPoint } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Splash: undefined;
};

export type AppTabsParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  AddTab: { recipeId?: string } | undefined;
  ShoppingListTab: undefined;
  ProfileTab: undefined;
};

export type LocalRecipeParam = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  rating: number;
  ingredients: string[];
  preparation: string;
};

export type RootStackParamList = {
  Auth: undefined;
  App: NavigatorScreenParams<AppTabsParamList> | undefined;
  RecipeDetail: { recipeId: string; localRecipe?: LocalRecipeParam };
  IngredientLocations: {
    ingredientName: string;
    locations: LocationPoint[];
  };
  Desayuno: undefined;
  Almuerzo: undefined;
  Cena: undefined;
  Postres: undefined;
};
