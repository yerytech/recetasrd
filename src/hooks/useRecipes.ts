import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getRecipes } from '../services/supabase';
import { Recipe } from '../types';

type RecipesFilter = {
  category: string;
  search: string;
};

type UseRecipesOptions = {
  initialCategory?: string;
};

/**
 * Hook para consultar recetas con filtros de búsqueda y categoría.
 */
export const useRecipes = (options?: UseRecipesOptions) => {
  const initialCategory = options?.initialCategory?.trim() || 'Todas';
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RecipesFilter>({
    category: initialCategory,
    search: '',
  });

  useEffect(() => {
    const nextCategory = initialCategory;

    setFilters((previous) => {
      if (previous.category === nextCategory) {
        return previous;
      }

      return {
        ...previous,
        category: nextCategory,
      };
    });
  }, [initialCategory]);

  const refreshRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getRecipes({
        category: filters.category,
        search: filters.search,
      });

      setRecipes(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudieron cargar las recetas.';
      setError(message);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters.category, filters.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refreshRecipes();
    }, 250);

    return () => clearTimeout(timer);
  }, [refreshRecipes]);

  useFocusEffect(
    useCallback(() => {
      void refreshRecipes();
      return undefined;
    }, [refreshRecipes]),
  );

  const setSearch = useCallback((search: string) => {
    setFilters((previous) => ({
      ...previous,
      search,
    }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setFilters((previous) => ({
      ...previous,
      category,
    }));
  }, []);

  return {
    recipes,
    isLoading,
    error,
    search: filters.search,
    selectedCategory: filters.category,
    setSearch,
    setCategory,
    refreshRecipes,
  };
};