import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONT_SIZE, LAYOUT, SPACING } from '../constants/theme';
import { useShoppingList } from '../hooks/useShoppingList';
import { AppTabsParamList } from '../navigation/types';
import { ShoppingItem } from '../types';

type Props = BottomTabScreenProps<AppTabsParamList, 'ShoppingListTab'>;

/**
 * Lista de compras persistente con checklist de ingredientes.
 */
export const ShoppingListScreen = ({}: Props) => {
  const { items, toggleItem, removeItem } = useShoppingList();

  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <View style={styles.itemContainer}>
      <Pressable
        hitSlop={10}
        onPress={() => toggleItem(item.id)}
        style={[styles.checkbox, item.completed && styles.checkboxChecked]}
      >
        {item.completed ? (
          <Ionicons color={COLORS.white} name="checkmark" size={14} />
        ) : null}
      </Pressable>

      <View style={styles.itemContent}>
        <Text style={[styles.itemName, item.completed && styles.itemNameDone]}>{item.name}</Text>
        <Text style={styles.itemQuantity}>{item.quantity}</Text>
        <Text style={styles.recipeTitle}>{item.recipeTitle}</Text>
      </View>

      <Pressable hitSlop={10} onPress={() => removeItem(item.id)}>
        <Ionicons color={COLORS.danger} name="close-circle-outline" size={18} />
      </Pressable>
    </View>
  );

  const completedCount = items.filter((item) => item.completed).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Lista de compras</Text>
          <Text style={styles.count}>{items.length} ingredientes</Text>
        </View>

        {items.length > 0 ? (
          <>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {completedCount} de {items.length} completados
            </Text>
          </>
        ) : null}

        <FlatList
          contentContainerStyle={styles.listContent}
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons color={COLORS.textSecondary} name="basket-outline" size={48} />
              <Text style={styles.emptyTitle}>Tu lista está vacía</Text>
              <Text style={styles.emptyText}>Agrega ingredientes desde los detalles de una receta.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: LAYOUT.contentHorizontalPadding,
    paddingTop: SPACING.sm,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  count: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    marginBottom: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  itemNameDone: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  itemQuantity: {
    marginTop: 2,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  recipeTitle: {
    marginTop: 2,
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingTop: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  emptyText: {
    marginTop: 6,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
  },
});
