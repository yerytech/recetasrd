import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';

import { STORAGE_KEYS } from '../constants/storage';
import { Ingredient, ShoppingItem } from '../types';

type ShoppingListContextValue = {
  items: ShoppingItem[];
  isLoading: boolean;
  addIngredients: (ingredients: Ingredient[], recipeId: string, recipeTitle: string) => Promise<void>;
  toggleItem: (itemId: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
};

export const ShoppingListContext = createContext<ShoppingListContextValue | undefined>(undefined);

const generateItemId = (): string => `shopping-item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/**
 * Proveedor de estado global para lista de compras.
 */
export const ShoppingListProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const saveItems = useCallback(async (nextItems: ShoppingItem[]) => {
    setItems(nextItems);
    await AsyncStorage.setItem(STORAGE_KEYS.shoppingList, JSON.stringify(nextItems));
  }, []);

  const hydrateShoppingList = useCallback(async () => {
    try {
      const rawItems = await AsyncStorage.getItem(STORAGE_KEYS.shoppingList);

      if (rawItems) {
        const parsedItems = JSON.parse(rawItems) as ShoppingItem[];
        setItems(parsedItems);
      }
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void hydrateShoppingList();
  }, [hydrateShoppingList]);

  const addIngredients = useCallback(
    async (ingredients: Ingredient[], recipeId: string, recipeTitle: string) => {
      if (!ingredients.length) {
        return;
      }

      const nextItems = [...items];

      ingredients.forEach((ingredient) => {
        const normalizedName = ingredient.name.trim().toLowerCase();
        const normalizedQuantity = ingredient.quantity.trim().toLowerCase();

        const exists = nextItems.some(
          (item) =>
            item.name.trim().toLowerCase() === normalizedName &&
            item.quantity.trim().toLowerCase() === normalizedQuantity,
        );

        if (!exists) {
          nextItems.push({
            id: ingredient.id || generateItemId(),
            name: ingredient.name.trim(),
            quantity: ingredient.quantity.trim(),
            completed: false,
            recipeId,
            recipeTitle,
          });
        }
      });

      await saveItems(nextItems);
    },
    [items, saveItems],
  );

  const toggleItem = useCallback(
    async (itemId: string) => {
      const nextItems = items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              completed: !item.completed,
            }
          : item,
      );

      await saveItems(nextItems);
    },
    [items, saveItems],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const nextItems = items.filter((item) => item.id !== itemId);
      await saveItems(nextItems);
    },
    [items, saveItems],
  );

  const value = useMemo<ShoppingListContextValue>(
    () => ({
      items,
      isLoading,
      addIngredients,
      toggleItem,
      removeItem,
    }),
    [addIngredients, isLoading, items, removeItem, toggleItem],
  );

  return <ShoppingListContext.Provider value={value}>{children}</ShoppingListContext.Provider>;
};