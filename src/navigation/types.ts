/**
 * Tipos de rutas para navegación.
 */

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Splash: undefined;
};

export type AppTabsParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  AddTab: undefined;
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
  App: undefined;
  RecipeDetail: { recipeId: string; localRecipe?: LocalRecipeParam };
  Desayuno: undefined;
  Almuerzo: undefined;
  Cena: undefined;
  Postres: undefined;
};
