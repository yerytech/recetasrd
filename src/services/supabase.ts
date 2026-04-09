import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, User as SupabaseAuthUser } from '@supabase/supabase-js';
import * as ImageManipulator from 'expo-image-manipulator';

import { MOCK_COMMENTS, MOCK_RATINGS, MOCK_RECIPES, MOCK_USERS } from '../constants/mockData';
import { Database, Json } from '../types/supabase';
import { Comment, Ingredient, LocationPoint, Rating, Recipe, RegisterPayload, User } from '../types';
import { calculateAverageRating } from '../utils/ratings';

type EnvironmentLike = {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

type RecipeLocation = LocationPoint;

type CreateRecipeInput = {
  title: string;
  category: string;
  imageUrl: string;
  ingredients: Ingredient[];
  preparation: string;
  location?: RecipeLocation | null;
};

type RecipeRow = Database['public']['Tables']['recipes']['Row'];
type CommentRow = Database['public']['Tables']['comments']['Row'];
type RatingRow = Database['public']['Tables']['ratings']['Row'];

const DEFAULT_RECIPE_IMAGE =
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80';
const RECIPE_IMAGE_BUCKET = 'recipe-images';
const PROFILE_AVATAR_BUCKET = 'profile-avatars';

const env = (globalThis as EnvironmentLike).process?.env ?? {};
const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
const passwordResetRedirectUrl = env.EXPO_PUBLIC_PASSWORD_RESET_REDIRECT_URL;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
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

const getBlobFromUri = async (uri: string): Promise<Blob> => {
  return await new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.onload = () => {
      const response = request.response;

      if (response instanceof Blob) {
        resolve(response);
        return;
      }

      reject(new Error('No se pudo leer la imagen seleccionada.'));
    };

    request.onerror = () => {
      reject(new Error('No se pudo leer la imagen seleccionada.'));
    };

    request.responseType = 'blob';
    request.open('GET', uri, true);
    request.send(null);
  });
};

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
      purchaseLocations?: unknown;
      purchaseLocation?: unknown;
    };

    const purchaseLocations = parseIngredientLocations(objectIngredient.purchaseLocations, objectIngredient.purchaseLocation);

    return {
      id: typeof objectIngredient.id === 'string' ? objectIngredient.id : generateId(`ingredient-${index}`),
      name: typeof objectIngredient.name === 'string' ? objectIngredient.name : 'Ingrediente',
      quantity: typeof objectIngredient.quantity === 'string' ? objectIngredient.quantity : '',
      purchaseLocations,
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

const parseIngredientLocations = (locations: unknown, legacyLocation?: unknown): LocationPoint[] => {
  if (Array.isArray(locations)) {
    return locations
      .map((location) => parseLocationData(location))
      .filter((location): location is LocationPoint => Boolean(location));
  }

  const singleLocation = parseLocationData(legacyLocation);
  return singleLocation ? [singleLocation] : [];
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
  const metadataAvatar =
    typeof supabaseUser.user_metadata?.avatar_url === 'string' ? supabaseUser.user_metadata.avatar_url : null;

  return {
    id: supabaseUser.id,
    name,
    email: supabaseUser.email ?? '',
    avatarUrl: metadataAvatar,
  };
};

const normalizeCategory = (value: string | undefined): string => {
  if (!value) {
    return '';
  }

  const normalized = value.trim().toLowerCase();

  const categoryAliases: Record<string, string> = {
    todas: 'todas',
    desayuno: 'desayuno',
    desayunos: 'desayuno',
    almuerzo: 'almuerzo',
    almuerzos: 'almuerzo',
    cena: 'cena',
    cenas: 'cena',
    postre: 'postre',
    postres: 'postre',
  };

  return categoryAliases[normalized] ?? normalized;
};

const escapePostgrestLikeValue = (value: string): string => {
  return value.replace(/([,%_])/g, '\\$1');
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
  const normalizedCategory = normalizeCategory(category);

  return recipes.filter((recipe) => {
    const normalizedRecipeCategory = normalizeCategory(recipe.category);
    const categoryMatch =
      normalizedCategory === 'todas' ||
      normalizedRecipeCategory === normalizedCategory ||
      normalizedRecipeCategory.includes(normalizedCategory) ||
      normalizedCategory.includes(normalizedRecipeCategory);
    const searchMatch =
      !search || recipe.title.toLowerCase().includes(search) || recipe.category.toLowerCase().includes(search);

    return categoryMatch && searchMatch;
  });
};

const getSupabaseAuthClient = () => {
  if (!supabase) {
    throw new Error(
      'Autenticacion no disponible. Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en .env y reinicia la app.',
    );
  }

  return supabase;
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

  const authClient = getSupabaseAuthClient();

  const { data, error } = await authClient.auth.signInWithPassword({ email: email.trim(), password });

  if (error || !data.user) {
    throw new Error(error?.message ?? 'No se pudo iniciar sesión.');
  }

  return mapSupabaseUserToAppUser(data.user);
};

export const registerUser = async ({ name, email, password }: RegisterPayload): Promise<User> => {
  if (!name.trim() || !email.trim() || !password.trim()) {
    throw new Error('Completa todos los campos requeridos.');
  }

  const authClient = getSupabaseAuthClient();

  const { data, error } = await authClient.auth.signUp({
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

export const recoverAccount = async (email: string): Promise<void> => {
  const cleanEmail = email.trim();

  if (!cleanEmail) {
    throw new Error('Ingresa tu correo para recuperar la cuenta.');
  }

  const authClient = getSupabaseAuthClient();

  const { error } = await authClient.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo: passwordResetRedirectUrl,
  });

  if (error) {
    throw new Error(error.message ?? 'No se pudo enviar el correo de recuperación.');
  }
};

export const updateAccountProfile = async (name: string, avatarUrl?: string | null): Promise<User> => {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error('El nombre no puede estar vacío.');
  }

  const authClient = getSupabaseAuthClient();
  const currentSession = await authClient.auth.getUser();
  const currentUser = currentSession.data.user;

  if (!currentUser) {
    throw new Error('No hay sesión activa.');
  }

  const nextAvatarUrl = avatarUrl === undefined
    ? (typeof currentUser.user_metadata?.avatar_url === 'string' ? currentUser.user_metadata.avatar_url : null)
    : avatarUrl;

  const { data, error } = await authClient.auth.updateUser({
    data: {
      name: cleanName,
      avatar_url: nextAvatarUrl,
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? 'No se pudo actualizar el perfil.');
  }

  return mapSupabaseUserToAppUser(data.user, cleanName);
};

export const updateAccountPassword = async (newPassword: string): Promise<void> => {
  const cleanPassword = newPassword.trim();

  if (cleanPassword.length < 8) {
    throw new Error('La nueva contraseña debe tener al menos 8 caracteres.');
  }

  const authClient = getSupabaseAuthClient();
  const { error } = await authClient.auth.updateUser({ password: cleanPassword });

  if (error) {
    throw new Error(error.message ?? 'No se pudo actualizar la contraseña.');
  }
};

export const getRecipes = async (options?: { search?: string; category?: string }): Promise<Recipe[]> => {
  if (!supabase) {
    return applyRecipeFilters(localRecipes, options);
  }

  try {
    const normalizedCategory = normalizeCategory(options?.category);
    const cleanSearch = options?.search?.trim() ?? '';

    let recipesQuery = supabase
      .from('recipes')
      .select('id, title, category, image_url, ingredients, preparation, author_id, location_data, created_at');

    if (normalizedCategory && normalizedCategory !== 'todas') {
      const categoryPattern = escapePostgrestLikeValue(normalizedCategory);
      recipesQuery = recipesQuery.ilike('category', `%${categoryPattern}%`);
    }

    if (cleanSearch) {
      const searchPattern = escapePostgrestLikeValue(cleanSearch);
      recipesQuery = recipesQuery.or(`title.ilike.%${searchPattern}%,category.ilike.%${searchPattern}%`);
    }

    const { data: recipeRows, error: recipesError } = await recipesQuery.order('created_at', { ascending: false });

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
      console.warn('[getRecipes] No se pudieron cargar comentarios:', commentsResult.error.message);
    }

    if (ratingsResult.error) {
      console.warn('[getRecipes] No se pudieron cargar valoraciones:', ratingsResult.error.message);
    }

    const comments = commentsResult.error ? [] : ((commentsResult.data ?? []) as CommentRow[]).map(mapCommentRow);
    const ratings = ratingsResult.error ? [] : ((ratingsResult.data ?? []) as RatingRow[]).map(mapRatingRow);

    const recipes = typedRecipes.map((recipeRow) => {
      const recipeComments = comments.filter((comment) => comment.recipeId === recipeRow.id);
      const recipeRatings = ratings.filter((rating) => rating.recipeId === recipeRow.id);
      return mapRecipeRow(recipeRow, recipeComments, recipeRatings);
    });

    return applyRecipeFilters(recipes, options);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudieron cargar las recetas desde Supabase.';
    throw new Error(message);
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
      console.warn('[getRecipeById] No se pudieron cargar comentarios:', commentsResult.error.message);
    }

    if (ratingsResult.error) {
      console.warn('[getRecipeById] No se pudieron cargar valoraciones:', ratingsResult.error.message);
    }

    const comments = commentsResult.error ? [] : ((commentsResult.data ?? []) as CommentRow[]).map(mapCommentRow);
    const ratings = ratingsResult.error ? [] : ((ratingsResult.data ?? []) as RatingRow[]).map(mapRatingRow);

    return mapRecipeRow(recipeRow as RecipeRow, comments, ratings);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo cargar la receta desde Supabase.';
    throw new Error(message);
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
      ingredients: cleanIngredients as unknown as Json,
      preparation,
      author_id: userId,
      location_data: (payload.location || null) as Json,
    })
    .select('id, title, category, image_url, ingredients, preparation, author_id, location_data, created_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'No se pudo guardar la receta.');
  }

  return mapRecipeRow(data as RecipeRow, [], []);
};

export const updateRecipe = async (
  recipeId: string,
  payload: CreateRecipeInput,
  userId: string,
): Promise<Recipe> => {
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
    const recipeIndex = localRecipes.findIndex((recipe) => recipe.id === recipeId);

    if (recipeIndex === -1) {
      throw new Error('Receta no encontrada.');
    }

    const currentRecipe = localRecipes[recipeIndex];

    if (currentRecipe.authorId !== userId) {
      throw new Error('Solo el autor puede editar la receta.');
    }

    const updatedRecipe: Recipe = {
      ...currentRecipe,
      title,
      category,
      imageUrl: payload.imageUrl.trim() || DEFAULT_RECIPE_IMAGE,
      ingredients: cleanIngredients,
      preparation,
      location: payload.location || null,
    };

    localRecipes[recipeIndex] = updatedRecipe;
    return updatedRecipe;
  }

  const { data, error } = await supabase
    .from('recipes')
    .update({
      title,
      category,
      image_url: payload.imageUrl.trim() || DEFAULT_RECIPE_IMAGE,
      ingredients: cleanIngredients as unknown as Json,
      preparation,
      location_data: (payload.location || null) as Json,
    })
    .eq('id', recipeId)
    .eq('author_id', userId)
    .select('id, title, category, image_url, ingredients, preparation, author_id, location_data, created_at')
    .maybeSingle();

  if (error) {
    throw new Error(error.message ?? 'No se pudo actualizar la receta.');
  }

  if (!data) {
    throw new Error('No tienes permisos para editar esta receta o no existe.');
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

  return mapRecipeRow(data as RecipeRow, comments, ratings);
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

export const deleteRecipe = async (recipeId: string, userId: string): Promise<void> => {
  if (!supabase) {
    const recipeIndex = localRecipes.findIndex((recipe) => recipe.id === recipeId);
    
    if (recipeIndex === -1) {
      throw new Error('Receta no encontrada.');
    }

    const recipe = localRecipes[recipeIndex];
    if (recipe.authorId !== userId) {
      throw new Error('Solo el autor puede eliminar la receta.');
    }

    localRecipes.splice(recipeIndex, 1);
    localComments = localComments.filter((comment) => comment.recipeId !== recipeId);
    localRatings = localRatings.filter((rating) => rating.recipeId !== recipeId);
    return;
  }

  try {
    // Verificar que el usuario es el autor
    const { data: recipeData, error: fetchError } = await supabase
      .from('recipes')
      .select('author_id, image_url')
      .eq('id', recipeId)
      .single();

    if (fetchError || !recipeData) {
      throw new Error('Receta no encontrada.');
    }

    if (recipeData.author_id !== userId) {
      throw new Error('Solo el autor puede eliminar la receta.');
    }

    const recipeImageUrl = typeof recipeData.image_url === 'string' ? recipeData.image_url.trim() : '';

    if (recipeImageUrl) {
      try {
        await deleteRecipeImageByUrl(recipeImageUrl);
      } catch {
        // Best effort cleanup: if storage deletion fails, keep deleting recipe data.
      }
    }

    // Eliminar la receta y sus comentarios/ratings relacionados
    const { error: deleteError } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId);

    if (deleteError) {
      throw deleteError;
    }

    // Limpiar comentarios orphaned (opcional, depende de tu BD constraints)
    await supabase
      .from('comments')
      .delete()
      .eq('recipe_id', recipeId);

    // Limpiar ratings orphaned
    await supabase
      .from('ratings')
      .delete()
      .eq('recipe_id', recipeId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo eliminar la receta.';
    throw new Error(message);
  }
};

export const uploadRecipeImage = async (imageUri: string, recipeId: string): Promise<string> => {
  if (!supabase) {
    return imageUri;
  }

  try {
    // Comprimir imagen
    const compressedResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 600, height: 400 } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
    );

    const fileBlob = await getBlobFromUri(compressedResult.uri);

    // Generar nombre único
    const fileName = `recipes/${recipeId}/image-${Date.now()}.jpg`;

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from(RECIPE_IMAGE_BUCKET)
      .upload(fileName, fileBlob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Generar URL pública
    const { data: publicUrlData } = supabase.storage
      .from(RECIPE_IMAGE_BUCKET)
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      throw new Error('No se pudo generar URL pública para la imagen.');
    }

    return publicUrlData.publicUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo subir la imagen.';
    throw new Error(message);
  }
};

const getRecipeImagePathFromUrl = (imageUrl: string): string | null => {
  const cleanUrl = imageUrl.trim();

  if (!cleanUrl) {
    return null;
  }

  try {
    const url = new URL(cleanUrl);
    const marker = `/storage/v1/object/public/${RECIPE_IMAGE_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const encodedPath = url.pathname.slice(markerIndex + marker.length);
    const decodedPath = decodeURIComponent(encodedPath).trim();

    return decodedPath || null;
  } catch {
    return null;
  }
};

export const deleteRecipeImageByUrl = async (imageUrl: string): Promise<void> => {
  if (!supabase) {
    return;
  }

  const filePath = getRecipeImagePathFromUrl(imageUrl);

  // Ignore non-Supabase or external image URLs.
  if (!filePath) {
    return;
  }

  const { error } = await supabase.storage.from(RECIPE_IMAGE_BUCKET).remove([filePath]);

  if (error) {
    throw new Error(error.message ?? 'No se pudo eliminar la imagen de Supabase.');
  }
};

const getProfileAvatarPathFromUrl = (imageUrl: string): string | null => {
  const cleanUrl = imageUrl.trim();

  if (!cleanUrl) {
    return null;
  }

  try {
    const url = new URL(cleanUrl);
    const marker = `/storage/v1/object/public/${PROFILE_AVATAR_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const encodedPath = url.pathname.slice(markerIndex + marker.length);
    const decodedPath = decodeURIComponent(encodedPath).trim();

    return decodedPath || null;
  } catch {
    return null;
  }
};

export const uploadProfileAvatar = async (imageUri: string, userId: string): Promise<string> => {
  if (!supabase) {
    return imageUri;
  }

  try {
    const compressedResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 512, height: 512 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
    );

    const fileBlob = await getBlobFromUri(compressedResult.uri);
    const fileName = `avatars/${userId}/avatar-${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from(PROFILE_AVATAR_BUCKET)
      .upload(fileName, fileBlob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(PROFILE_AVATAR_BUCKET)
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      throw new Error('No se pudo generar URL pública para el avatar.');
    }

    return publicUrlData.publicUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo subir la foto de perfil.';
    throw new Error(message);
  }
};

export const deleteProfileAvatarByUrl = async (imageUrl: string): Promise<void> => {
  if (!supabase) {
    return;
  }

  const filePath = getProfileAvatarPathFromUrl(imageUrl);

  if (!filePath) {
    return;
  }

  const { error } = await supabase.storage.from(PROFILE_AVATAR_BUCKET).remove([filePath]);

  if (error) {
    throw new Error(error.message ?? 'No se pudo eliminar la foto de perfil de Supabase.');
  }
};
