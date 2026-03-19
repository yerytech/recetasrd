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

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  RecipeDetail: { recipeId: string };
};
