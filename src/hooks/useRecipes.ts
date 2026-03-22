import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getRecipes } from '../services/supabase';
import { Recipe } from '../types';

type RecipesFilter = {
  category: string;
  search: string;
};

/**
 * Hook para consultar recetas con filtros de búsqueda y categoría.
 */
export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RecipesFilter>({
    category: 'Todas',
    search: '',
  });

  const refreshRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getRecipes({
        category: filters.category,
        search: filters.search,
      });

      setRecipes(data);
    } catch {
      setError('No se pudieron cargar las recetas.');
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