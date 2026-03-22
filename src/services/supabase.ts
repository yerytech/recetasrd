import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, User as SupabaseAuthUser } from '@supabase/supabase-js';

import { MOCK_COMMENTS, MOCK_RATINGS, MOCK_RECIPES, MOCK_USERS } from '../constants/mockData';
import { Comment, Ingredient, Rating, Recipe, RegisterPayload, User } from '../types';
import { calculateAverageRating } from '../utils/ratings';

type EnvironmentLike = {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

type RecipeLocation = {
  address: string;
  latitude: number;
  longitude: number;
};

type CreateRecipeInput = {
  title: string;
  category: string;
  imageUrl: string;
  ingredients: Ingredient[];
  preparation: string;
  location?: RecipeLocation | null;
};

type RecipeRow = {
  id: string;
  title?: string | null;
  category?: string | null;
  image_url?: string | null;
  ingredients?: unknown;
  preparation?: string | null;
  author_id?: string | null;
  location_data?: unknown;
  created_at?: string | null;
};

type CommentRow = {
  id: string;
  recipe_id?: string | null;
  user_id?: string | null;
  user_name?: string | null;
  content?: string | null;
  created_at?: string | null;
};

type RatingRow = {
  id: string;
  recipe_id?: string | null;
  user_id?: string | null;
  value?: number | null;
  created_at?: string | null;
};

const DEFAULT_RECIPE_IMAGE =
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80';

const env = (globalThis as EnvironmentLike).process?.env ?? {};
const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

let localUsers: User[] = [...MOCK_USERS];
let localRecipes: Recipe[] = [...MOCK_RECIPES];
let localComments: Comment[] = [...MOCK_COMMENTS];
let localRatings: Rating[] = [...MOCK_RATINGS];

const generateId = (prefix: string): string => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const normalizeIngredient = (ingredient: unknown, index: number): Ingredient => {
  if (typeof ingredient === 'string') {
    return {
      id: generateId(`ingredient-${index}`),
      name: ingredient,
      quantity: '',
    };
  }

  if (ingredient && typeof ingredient === 'object') {
    const objectIngredient = ingredient as {
      id?: unknown;
      name?: unknown;
      quantity?: unknown;
      purchaseLocation?: unknown;
    };

    const purchaseLocation = parseLocationData(objectIngredient.purchaseLocation);

    return {
      id: typeof objectIngredient.id === 'string' ? objectIngredient.id : generateId(`ingredient-${index}`),
      name: typeof objectIngredient.name === 'string' ? objectIngredient.name : 'Ingrediente',
      quantity: typeof objectIngredient.quantity === 'string' ? objectIngredient.quantity : '',
      purchaseLocation,
    };
  }

  return {
    id: generateId(`ingredient-${index}`),
    name: 'Ingrediente',
    quantity: '',
  };
};

const normalizeIngredients = (ingredients: unknown): Ingredient[] => {
  if (!Array.isArray(ingredients)) {
    return [];
  }

  return ingredients.map((ingredient, index) => normalizeIngredient(ingredient, index));
};

const parseLocationData = (location: unknown): RecipeLocation | null => {
  if (!location || typeof location !== 'object') {
    return null;
  }

  const maybeLocation = location as {
    address?: unknown;
    latitude?: unknown;
    longitude?: unknown;
  };

  if (
    typeof maybeLocation.address !== 'string' ||
    typeof maybeLocation.latitude !== 'number' ||
    typeof maybeLocation.longitude !== 'number'
  ) {
    return null;
  }

  return {
    address: maybeLocation.address,
    latitude: maybeLocation.latitude,
    longitude: maybeLocation.longitude,
  };
};

const mapCommentRow = (row: CommentRow): Comment => ({
  id: row.id,
  recipeId: row.recipe_id ?? '',
  userId: row.user_id ?? '',
  userName: row.user_name ?? 'Usuario',
  content: row.content ?? '',
  createdAt: row.created_at ?? new Date().toISOString(),
});

const mapRatingRow = (row: RatingRow): Rating => ({
  id: row.id,
  recipeId: row.recipe_id ?? '',
  userId: row.user_id ?? '',
  value: typeof row.value === 'number' ? row.value : 0,
  createdAt: row.created_at ?? new Date().toISOString(),
});

const mapRecipeRow = (row: RecipeRow, comments: Comment[], ratings: Rating[]): Recipe => ({
  id: row.id,
  title: row.title?.trim() || 'Receta sin título',
  category: row.category?.trim() || 'General',
  imageUrl: row.image_url?.trim() || DEFAULT_RECIPE_IMAGE,
  ingredients: normalizeIngredients(row.ingredients),
  preparation: row.preparation?.trim() || '',
  authorId: row.author_id ?? '',
  averageRating: calculateAverageRating(ratings),
  ratingsCount: ratings.length,
  comments,
  createdAt: row.created_at ?? new Date().toISOString(),
  location: parseLocationData(row.location_data),
});

const mapSupabaseUserToAppUser = (supabaseUser: SupabaseAuthUser, fallbackName?: string): User => {
  const metadataName =
    typeof supabaseUser.user_metadata?.name === 'string' ? supabaseUser.user_metadata.name : undefined;
  const name = metadataName?.trim() || fallbackName?.trim() || 'Usuario Recetas RD';

  return {
    id: supabaseUser.id,
    name,
    email: supabaseUser.email ?? '',
    avatarUrl: null,
  };
};

const applyRecipeFilters = (
  recipes: Recipe[],
  options?: {
    search?: string;
    category?: string;
  },
): Recipe[] => {
  const search = options?.search?.trim().toLowerCase() ?? '';
  const category = options?.category ?? 'Todas';

  return recipes.filter((recipe) => {
    const categoryMatch = category === 'Todas' || recipe.category === category;
    const searchMatch =
      !search || recipe.title.toLowerCase().includes(search) || recipe.category.toLowerCase().includes(search);

    return categoryMatch && searchMatch;
  });
};

const rebuildLocalRecipeStats = (recipeId: string): void => {
  localRecipes = localRecipes.map((recipe) => {
    if (recipe.id !== recipeId) {
      return recipe;
    }

    const ratings = localRatings.filter((rating) => rating.recipeId === recipe.id);
    const comments = localComments.filter((comment) => comment.recipeId === recipe.id);

    return {
      ...recipe,
      averageRating: calculateAverageRating(ratings),
      ratingsCount: ratings.length,
      comments,
    };
  });
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  if (!email.trim() || !password.trim()) {
    throw new Error('Completa correo y contraseña.');
  }

  if (!supabase) {
    const foundUser = localUsers.find((user) => user.email.toLowerCase() === email.trim().toLowerCase());

    if (!foundUser) {
      throw new Error('Usuario no encontrado en modo local. Regístrate primero.');
    }

    return foundUser;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

  if (error || !data.user) {
    throw new Error(error?.message ?? 'No se pudo iniciar sesión.');
  }

  return mapSupabaseUserToAppUser(data.user);
};

export const registerUser = async ({ name, email, password }: RegisterPayload): Promise<User> => {
  if (!name.trim() || !email.trim() || !password.trim()) {
    throw new Error('Completa todos los campos requeridos.');
  }

  if (!supabase) {
    const existingUser = localUsers.find((user) => user.email.toLowerCase() === email.trim().toLowerCase());

    if (existingUser) {
      throw new Error('Ya existe un usuario con este correo.');
    }

    const newUser: User = {
      id: generateId('user'),
      name: name.trim(),
      email: email.trim(),
      avatarUrl: null,
    };

    localUsers = [newUser, ...localUsers];
    return newUser;
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        name: name.trim(),
      },
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? 'No se pudo registrar la cuenta.');
  }

  return mapSupabaseUserToAppUser(data.user, name);
};

export const getRecipes = async (options?: { search?: string; category?: string }): Promise<Recipe[]> => {
  if (!supabase) {
    return applyRecipeFilters(localRecipes, options);
  }

  try {
    const { data: recipeRows, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, category, image_url, ingredients, preparation, author_id, location_data, created_at')
      .order('created_at', { ascending: false });

    if (recipesError) {
      throw recipesError;
    }

    const typedRecipes = ((recipeRows ?? []) as RecipeRow[]).filter((row) => row.id);
    const recipeIds = typedRecipes.map((recipe) => recipe.id);

    const [commentsResult, ratingsResult] = await Promise.all([
      recipeIds.length
        ? supabase
            .from('comments')
            .select('id, recipe_id, user_id, user_name, content, created_at')
            .in('recipe_id', recipeIds)
            .order('created_at', { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      recipeIds.length
        ? supabase.from('ratings').select('id, recipe_id, user_id, value, created_at').in('recipe_id', recipeIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (commentsResult.error) {
      throw commentsResult.error;
    }

    if (ratingsResult.error) {
      throw ratingsResult.error;
    }

    const comments = ((commentsResult.data ?? []) as CommentRow[]).map(mapCommentRow);
    const ratings = ((ratingsResult.data ?? []) as RatingRow[]).map(mapRatingRow);

    const recipes = typedRecipes.map((recipeRow) => {
      const recipeComments = comments.filter((comment) => comment.recipeId === recipeRow.id);
      const recipeRatings = ratings.filter((rating) => rating.recipeId === recipeRow.id);
      return mapRecipeRow(recipeRow, recipeComments, recipeRatings);
    });

    return applyRecipeFilters(recipes, options);
  } catch {
    return applyRecipeFilters(localRecipes, options);
  }
};

export const getRecipeById = async (recipeId: string): Promise<Recipe | null> => {
  if (!supabase) {
    return localRecipes.find((recipe) => recipe.id === recipeId) ?? null;
  }

  try {
    const { data: recipeRow, error: recipeError } = await supabase
      .from('recipes')
      .select('id, title, category, image_url, ingredients, preparation, author_id, location_data, created_at')
      .eq('id', recipeId)
      .maybeSingle();

    if (recipeError) {
      throw recipeError;
    }

    if (!recipeRow) {
      return null;
    }

    const [commentsResult, ratingsResult] = await Promise.all([
      supabase
        .from('comments')
        .select('id, recipe_id, user_id, user_name, content, created_at')
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false }),
      supabase.from('ratings').select('id, recipe_id, user_id, value, created_at').eq('recipe_id', recipeId),
    ]);

    if (commentsResult.error) {
      throw commentsResult.error;
    }

    if (ratingsResult.error) {
      throw ratingsResult.error;
    }

    const comments = ((commentsResult.data ?? []) as CommentRow[]).map(mapCommentRow);
    const ratings = ((ratingsResult.data ?? []) as RatingRow[]).map(mapRatingRow);

    return mapRecipeRow(recipeRow as RecipeRow, comments, ratings);
  } catch {
    return localRecipes.find((recipe) => recipe.id === recipeId) ?? null;
  }
};

export const createRecipe = async (payload: CreateRecipeInput, userId: string): Promise<Recipe> => {
  const title = payload.title.trim();
  const category = payload.category.trim();
  const preparation = payload.preparation.trim();

  if (!title || !category || !preparation) {
    throw new Error('Completa nombre, categoría y preparación.');
  }

  const cleanIngredients = payload.ingredients.filter((ingredient) => ingredient.name.trim());

  if (!cleanIngredients.length) {
    throw new Error('Agrega al menos un ingrediente.');
  }

  if (!supabase) {
    const newRecipe: Recipe = {
      id: generateId('recipe'),
      title,
      category,
      imageUrl: payload.imageUrl.trim() || DEFAULT_RECIPE_IMAGE,
      ingredients: cleanIngredients,
      preparation,
      authorId: userId,
      averageRating: 0,
      ratingsCount: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      location: payload.location || null,
    };

    localRecipes = [newRecipe, ...localRecipes];
    return newRecipe;
  }

  const { data, error } = await supabase
    .from('recipes')
    .insert({
      title,
      category,
      image_url: payload.imageUrl.trim() || DEFAULT_RECIPE_IMAGE,
      ingredients: cleanIngredients,
      preparation,
      author_id: userId,
      location_data: payload.location || null,
    })
    .select('id, title, category, image_url, ingredients, preparation, author_id, location_data, created_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'No se pudo guardar la receta.');
  }

  return mapRecipeRow(data as RecipeRow, [], []);
};

export const addComment = async (
  recipeId: string,
  userId: string,
  content: string,
  userName: string,
): Promise<Comment> => {
  const cleanContent = content.trim();

  if (!cleanContent) {
    throw new Error('Escribe un comentario antes de publicar.');
  }

  if (!supabase) {
    const comment: Comment = {
      id: generateId('comment'),
      recipeId,
      userId,
      userName,
      content: cleanContent,
      createdAt: new Date().toISOString(),
    };

    localComments = [comment, ...localComments];
    rebuildLocalRecipeStats(recipeId);
    return comment;
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      recipe_id: recipeId,
      user_id: userId,
      user_name: userName,
      content: cleanContent,
    })
    .select('id, recipe_id, user_id, user_name, content, created_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'No se pudo publicar el comentario.');
  }

  return mapCommentRow(data as CommentRow);
};

export const addRating = async (recipeId: string, userId: string, value: number): Promise<Rating> => {
  if (value < 1 || value > 5) {
    throw new Error('La calificación debe estar entre 1 y 5.');
  }

  if (!supabase) {
    const existing = localRatings.find((rating) => rating.recipeId === recipeId && rating.userId === userId);

    if (existing) {
      existing.value = value;
      existing.createdAt = new Date().toISOString();
      rebuildLocalRecipeStats(recipeId);
      return existing;
    }

    const newRating: Rating = {
      id: generateId('rating'),
      recipeId,
      userId,
      value,
      createdAt: new Date().toISOString(),
    };

    localRatings = [newRating, ...localRatings];
    rebuildLocalRecipeStats(recipeId);
    return newRating;
  }

  const { data, error } = await supabase
    .from('ratings')
    .upsert(
      {
        recipe_id: recipeId,
        user_id: userId,
        value,
      },
      {
        onConflict: 'recipe_id,user_id',
      },
    )
    .select('id, recipe_id, user_id, value, created_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'No se pudo registrar la calificación.');
  }

  return mapRatingRow(data as RatingRow);
};
