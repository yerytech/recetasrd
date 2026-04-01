import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';

import { STORAGE_KEYS } from '../constants/storage';
import { Ingredient, LocationPoint, ShoppingItem } from '../types';

type ShoppingListContextValue = {
  items: ShoppingItem[];
  isLoading: boolean;
  addIngredients: (ingredients: Ingredient[], recipeId: string, recipeTitle: string) => Promise<void>;
  toggleItem: (itemId: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
};

export const ShoppingListContext = createContext<ShoppingListContextValue | undefined>(undefined);

const generateItemId = (): string => `shopping-item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const ensureUniqueIds = (shoppingItems: ShoppingItem[]): ShoppingItem[] => {
  const usedIds = new Set<string>();

  return shoppingItems.map((item) => {
    let nextId = item.id?.trim() || generateItemId();

    while (usedIds.has(nextId)) {
      nextId = generateItemId();
    }

    usedIds.add(nextId);

    return {
      ...item,
      id: nextId,
    };
  });
};

const isLocationPoint = (value: unknown): value is LocationPoint => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const location = value as { address?: unknown; latitude?: unknown; longitude?: unknown };

  return (
    typeof location.address === 'string' &&
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number'
  );
};

const normalizePurchaseLocations = (rawLocations: unknown, legacyLocation?: unknown): LocationPoint[] => {
  if (Array.isArray(rawLocations)) {
    return rawLocations.filter(isLocationPoint);
  }

  return isLocationPoint(legacyLocation) ? [legacyLocation] : [];
};

const normalizeShoppingItems = (items: unknown): ShoppingItem[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const candidate = item as ShoppingItem & {
        purchaseLocation?: unknown;
        purchaseLocations?: unknown;
      };

      return {
        ...candidate,
        purchaseLocations: normalizePurchaseLocations(candidate.purchaseLocations, candidate.purchaseLocation),
      };
    });
};

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
        const parsedItems = normalizeShoppingItems(JSON.parse(rawItems));
        const normalizedItems = ensureUniqueIds(parsedItems);
        setItems(normalizedItems);

        if (normalizedItems.some((item, index) => item.id !== parsedItems[index]?.id)) {
          await AsyncStorage.setItem(STORAGE_KEYS.shoppingList, JSON.stringify(normalizedItems));
        }
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
            id: generateItemId(),
            name: ingredient.name.trim(),
            quantity: ingredient.quantity.trim(),
            purchaseLocations: ingredient.purchaseLocations ?? [],
            completed: false,
            recipeId,
            recipeTitle,
          });
        }
      });

      await saveItems(ensureUniqueIds(nextItems));
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