import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  Pressable,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryCard } from '../components/CategoryCard';
import { RecipeListItem } from '../components/RecipeListItem';
import { SearchInput } from '../components/SearchInput';
import { AppTabsParamList, RootStackParamList } from '../navigation/types';
import { useRecipes } from '../hooks/useRecipes';
import { getResponsiveFontSize, getResponsiveMaxWidth } from '../utils/responsive';

type Props = BottomTabScreenProps<AppTabsParamList, 'HomeTab'>;

/**
 * Home principal con datos de la base de datos.
 */
export const HomeScreen = ({ navigation }: Props) => {
  const rootNavigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState('');
  const [popularPage, setPopularPage] = useState(1);
  const { recipes, isLoading, error, setSearch: setRecipeSearch } = useRecipes();
  const { width } = useWindowDimensions();
  const contentMaxWidth = getResponsiveMaxWidth(width, 760, 1200);
  const titleSize = getResponsiveFontSize(width, 31);
  const sectionTitleSize = getResponsiveFontSize(width, 22);
  const popularPageSize = 6;

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
  const popularRecipes = useMemo(
    () => [...recipes].sort((a, b) => b.averageRating - a.averageRating),
    [recipes],
  );

  const paginatedPopularRecipes = useMemo(
    () => popularRecipes.slice(0, popularPage * popularPageSize),
    [popularPage, popularRecipes],
  );

  const hasMorePopularRecipes = paginatedPopularRecipes.length < popularRecipes.length;

  useEffect(() => {
    setPopularPage(1);
  }, [popularRecipes.length]);

  const handleLoadMorePopularRecipes = () => {
    if (!hasMorePopularRecipes) {
      return;
    }

    setPopularPage((previous) => previous + 1);
  };

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
        <View style={styles.pageContent}>
          <View style={[styles.centeredContent, { maxWidth: contentMaxWidth }]}> 
            <View style={styles.header}>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.72}
                numberOfLines={1}
                style={[styles.headerTitle, { fontSize: titleSize }]}
              >
                Recetas RD
              </Text>
            </View>

            <SearchInput
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
            ) : null}
          </View>

          {!isLoading ? (
            <>
              <View style={styles.categoriesSection}>
                <View style={[styles.centeredContent, { maxWidth: contentMaxWidth }]}> 
                  <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize }]}>Categorías</Text>
                </View>

                <FlatList
                  contentContainerStyle={styles.categoriesContainer}
                  data={CATEGORIES}
                  horizontal
                  decelerationRate="fast"
                  snapToAlignment="start"
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(category) => category.id}
                  renderItem={({ item: category }) => (
                    <CategoryCard
                      imageUrl={category.imageUrl}
                      title={category.name}
                      onPress={() => handleCategoryPress(category.name)}
                    />
                  )}
                />
              </View>

              <View style={styles.popularSection}> 
                <View style={styles.popularHeadingWrapper}>
                  <Text style={[styles.sectionTitle, styles.popularHeading, { fontSize: sectionTitleSize }]}>Recetas populares</Text>
                </View>

                <View style={styles.popularListShell}>
                  {popularRecipes.length > 0 ? (
                    <>
                      <FlatList
                        contentContainerStyle={styles.recipesContainer}
                        data={paginatedPopularRecipes}
                        keyExtractor={(recipe) => recipe.id}
                        nestedScrollEnabled
                        onEndReached={handleLoadMorePopularRecipes}
                        onEndReachedThreshold={0.25}
                        renderItem={({ item }) => (
                          <RecipeListItem
                            imageUrl={item.imageUrl}
                            isFavorite={false}
                            onPress={() => rootNavigation.navigate('RecipeDetail', { recipeId: item.id })}
                            rating={item.averageRating}
                            title={item.title}
                          />
                        )}
                        showsVerticalScrollIndicator={false}
                        style={styles.popularList}
                      />

                      {hasMorePopularRecipes ? (
                        <View style={styles.paginationBar}>
                          <Pressable onPress={handleLoadMorePopularRecipes} style={styles.paginationButton}>
                            <Text style={styles.paginationButtonText}>Cargar mas</Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </>
                  ) : (
                    <Text style={styles.emptyText}>No hay recetas disponibles</Text>
                  )}
                </View>
              </View>
            </>
          ) : null}
        </View>
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
  pageContent: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 28,
  },
  centeredContent: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 31,
    color: '#C9822B',
    fontWeight: '700',
    letterSpacing: 0.3,
    width: '100%',
    textAlign: 'center',
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
    paddingLeft: 20,
    paddingRight: 28,
    paddingBottom: 10,
  },
  categoriesSection: {
    marginBottom: 8,
  },
  popularSection: {
    marginTop: 8,
    width: '100%',
  },
  popularHeadingWrapper: {
    paddingHorizontal: 20,
  },
  popularHeading: {
    marginBottom: 12,
  },
  recipesContainer: {
    paddingBottom: 8,
    paddingHorizontal: 0,
    paddingTop: 12,
  },
  popularListShell: {
    backgroundColor: 'transparent',
    marginHorizontal: 0,
    borderRadius: 0,
    maxHeight: 420,
    minHeight: 240,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0,
    shadowRadius: 8,
    elevation: 0,
    overflow: 'hidden',
  },
  popularList: {
    paddingHorizontal: 12,
  },
  paginationBar: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#FAFAFA',
  },
  paginationButton: {
    backgroundColor: '#C9822B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  paginationButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
