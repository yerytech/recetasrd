import { useContext } from 'react';

import { ShoppingListContext } from '../context/ShoppingListContext';

/**
 * Hook de acceso al contexto de lista de compras.
 */
export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);

  if (!context) {
    throw new Error('useShoppingList debe usarse dentro de ShoppingListProvider.');
  }

  return context;
};