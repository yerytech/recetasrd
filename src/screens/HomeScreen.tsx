import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryCard } from '../components/CategoryCard';
import { RecipeListItem } from '../components/RecipeListItem';
import { SearchInput } from '../components/SearchInput';
import { AppTabsParamList, RootStackParamList } from '../navigation/types';
import { useRecipes } from '../hooks/useRecipes';

type Props = BottomTabScreenProps<AppTabsParamList, 'HomeTab'>;

/**
 * Home principal con datos de la base de datos.
 */
export const HomeScreen = ({ navigation }: Props) => {
  const rootNavigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState('');
  const { recipes, isLoading, error, setSearch: setRecipeSearch } = useRecipes();

  // Actualizar búsqueda en el hook
  const handleSearch = (text: string) => {
    setSearch(text);
    setRecipeSearch(text);
  };

  // Categorías fijas con imágenes específicas
  const CATEGORIES = [
    {
      id: 'cat-1',
      name: 'Desayuno',
      imageUrl: recipes.find(r => r.category === 'Desayuno')?.imageUrl ||
        'https://images.unsplash.com/photo-1533189549336-2a0aef5e2c4d?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'cat-2',
      name: 'Almuerzo',
      imageUrl: recipes.find(r => r.category === 'Almuerzo')?.imageUrl ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'cat-3',
      name: 'Cena',
      imageUrl: recipes.find(r => r.category === 'Cena')?.imageUrl ||
        'https://images.unsplash.com/photo-1555939594-58d7cb561404?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'cat-4',
      name: 'Postres',
      imageUrl: recipes.find(r => r.category === 'Postres')?.imageUrl ||
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80',
    },
  ];

  // Recetas populares ordenadas por rating
  const popularRecipes = [...recipes]
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 5);

  const handleCategoryPress = (categoryName: string) => {
    const categoryMap: Record<string, 'Desayuno' | 'Almuerzo' | 'Cena' | 'Postres'> = {
      'Desayuno': 'Desayuno',
      'Almuerzo': 'Almuerzo',
      'Cena': 'Cena',
      'Postres': 'Postres',
    };
    
    const route = categoryMap[categoryName as keyof typeof categoryMap];
    if (route) {
      rootNavigation.navigate(route);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[styles.contentContainer, styles.contentBottomSpacing]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Recetas RD</Text>
          </View>

          <SearchInput
            containerStyle={styles.searchInput}
            onChangeText={handleSearch}
            placeholder="Buscar recetas..."
            value={search}
          />

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#C9822B" />
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Categorías</Text>
              <ScrollView
                contentContainerStyle={styles.categoriesContainer}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {CATEGORIES.map((category) => (
                  <CategoryCard 
                    key={category.id} 
                    imageUrl={category.imageUrl} 
                    title={category.name}
                    onPress={() => handleCategoryPress(category.name)}
                  />
                ))}
              </ScrollView>

              <Text style={styles.sectionTitle}>Recetas populares</Text>
              <View style={styles.recipesContainer}>
                {popularRecipes.length > 0 ? (
                  popularRecipes.map((recipe) => (
                    <RecipeListItem
                      imageUrl={recipe.imageUrl}
                      isFavorite={false}
                      key={recipe.id}
                      onPress={() => rootNavigation.navigate('RecipeDetail', { recipeId: recipe.id })}
                      rating={recipe.averageRating}
                      title={recipe.title}
                    />
                  ))
                ) : (
                  <Text style={styles.emptyText}>No hay recetas disponibles</Text>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  screen: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  contentBottomSpacing: {
    paddingBottom: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 31,
    color: '#C9822B',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  searchInput: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#1A1A1A',
    fontWeight: '700',
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingRight: 8,
    marginBottom: 24,
  },
  recipesContainer: {
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
