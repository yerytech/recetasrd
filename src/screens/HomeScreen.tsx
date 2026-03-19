import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CategoryItem } from '../components/CategoryItem';
import { RecipeCard } from '../components/RecipeCard';
import { RECIPE_CATEGORIES } from '../constants/categories';
import { COLORS, FONT_SIZE, LAYOUT, SPACING } from '../constants/theme';
import { useRecipes } from '../hooks/useRecipes';
import { AppTabsParamList, RootStackParamList } from '../navigation/types';
import { Recipe } from '../types';

type Props = BottomTabScreenProps<AppTabsParamList, 'HomeTab'>;

/**
 * Pantalla principal con búsqueda, categorías y recetas destacadas.
 */
export const HomeScreen = ({ navigation }: Props) => {
  const rootNavigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { recipes, isLoading, error, search, selectedCategory, setSearch, setCategory, refreshRecipes } = useRecipes();

  const categories = useMemo(() => RECIPE_CATEGORIES, []);

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <RecipeCard onPress={() => rootNavigation.navigate('RecipeDetail', { recipeId: item.id })} recipe={item} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={recipes}
        keyExtractor={(item) => item.id}
        onRefresh={refreshRecipes}
        refreshing={isLoading}
        renderItem={renderRecipe}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>¿Qué quieres cocinar hoy?</Text>

              <Pressable onPress={() => navigation.navigate('ProfileTab')}>
                <Ionicons color={COLORS.primary} name="person-circle-outline" size={36} />
              </Pressable>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons color={COLORS.textSecondary} name="search-outline" size={20} />
              <TextInput
                onChangeText={setSearch}
                placeholder="Buscar recetas..."
                placeholderTextColor={COLORS.textSecondary}
                style={styles.searchInput}
                value={search}
              />
            </View>

            <ScrollView
              contentContainerStyle={styles.categoriesContent}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {categories.map((category) => (
                <CategoryItem
                  active={selectedCategory === category}
                  key={category}
                  label={category}
                  onPress={() => setCategory(category)}
                />
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Recetas</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {isLoading ? <ActivityIndicator color={COLORS.primary} style={styles.inlineLoader} /> : null}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No encontramos recetas</Text>
              <Text style={styles.emptyText}>Prueba otra búsqueda o cambia la categoría.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: LAYOUT.contentHorizontalPadding,
    paddingBottom: SPACING.xl,
  },
  header: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
    fontWeight: '700',
    flex: 1,
    marginRight: SPACING.md,
  },
  searchContainer: {
    backgroundColor: COLORS.inputBackground,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    marginLeft: SPACING.xs,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
  },
  categoriesContent: {
    paddingBottom: SPACING.sm,
  },
  sectionTitle: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    fontSize: FONT_SIZE.lg,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  inlineLoader: {
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.danger,
    marginBottom: SPACING.sm,
    fontSize: FONT_SIZE.sm,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
});
