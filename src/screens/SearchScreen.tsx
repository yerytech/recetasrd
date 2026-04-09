import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecipeCard } from '../components/RecipeCard';
import { COLORS, FONT_SIZE, LAYOUT, SPACING } from '../constants/theme';
import { useRecipes } from '../hooks/useRecipes';
import { RootStackParamList } from '../navigation/types';
import { Recipe } from '../types';
import { getResponsiveMaxWidth } from '../utils/responsive';

/**
 * Pantalla dedicada de búsqueda de recetas.
 */
export const SearchScreen = () => {
  const rootNavigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { recipes, isLoading, search, setSearch, setCategory } = useRecipes();
  const { width } = useWindowDimensions();
  const contentMaxWidth = getResponsiveMaxWidth(width, 720, 1100);

  useEffect(() => {
    setCategory('Todas');
  }, [setCategory]);

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <RecipeCard onPress={() => rootNavigation.navigate('RecipeDetail', { recipeId: item.id })} recipe={item} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={[styles.container, { maxWidth: contentMaxWidth, alignSelf: 'center' }]}>
        <Text style={styles.title}>Buscar recetas</Text>

        <View style={styles.searchContainer}>
          <Ionicons color={COLORS.textSecondary} name="search-outline" size={20} />
          <TextInput
            onChangeText={setSearch}
            placeholder="Escribe el nombre del plato"
            placeholderTextColor={COLORS.textSecondary}
            style={styles.searchInput}
            value={search}
          />
        </View>

        {isLoading ? <ActivityIndicator color={COLORS.primary} style={styles.loader} /> : null}

        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={renderRecipe}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay resultados para tu búsqueda.</Text>
              </View>
            ) : null
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
  },
  title: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
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
  loader: {
    marginBottom: SPACING.sm,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
});
