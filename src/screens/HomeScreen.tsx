import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabBar, HomeTabKey } from '../components/BottomTabBar';
import { CategoryCard } from '../components/CategoryCard';
import { FloatingButton } from '../components/FloatingButton';
import { RecipeListItem } from '../components/RecipeListItem';
import { SearchInput } from '../components/SearchInput';
import { AppTabsParamList, RootStackParamList } from '../navigation/types';

type Props = BottomTabScreenProps<AppTabsParamList, 'HomeTab'>;

interface Category {
  id: string;
  name: string;
  imageUrl: string;
}

interface PopularRecipe {
  id: string;
  name: string;
  rating: number;
  imageUrl: string;
  isFavorite?: boolean;
}

const CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Desayunos',
    imageUrl:
      'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'cat-2',
    name: 'Almuerzos',
    imageUrl:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'cat-3',
    name: 'Cena',
    imageUrl:
      'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'cat-4',
    name: 'Postres',
    imageUrl:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=200&q=80',
  },
];

const POPULAR_RECIPES: PopularRecipe[] = [
  {
    id: 'receta-1',
    name: 'Mangú con los 3 golpes',
    rating: 4.6,
    imageUrl:
      'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=200&q=80',
    isFavorite: true,
  },
  {
    id: 'receta-2',
    name: 'Sancocho Dominicano',
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=200&q=80',
    isFavorite: false,
  },
  {
    id: 'receta-4',
    name: 'Habichuelas con dulce',
    rating: 4.7,
    imageUrl:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=200&q=80',
    isFavorite: true,
  },
];

const ROUTE_BY_TAB: Record<HomeTabKey, keyof AppTabsParamList> = {
  home: 'HomeTab',
  search: 'SearchTab',
  favorites: 'ShoppingListTab',
  profile: 'ProfileTab',
};

/**
 * Home principal con layout minimalista de recetas.
 */
export const HomeScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const rootNavigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState('');

  const handleTabPress = (tab: HomeTabKey) => {
    navigation.navigate(ROUTE_BY_TAB[tab]);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[
            styles.contentContainer,
            {
              paddingBottom: 210 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Ionicons color="#1A1A1A" name="menu" size={28} />
            <Text style={styles.headerTitle}>Recetas RD</Text>
            <View style={styles.headerSpacer} />
          </View>

          <SearchInput
            containerStyle={styles.searchInput}
            onChangeText={setSearch}
            placeholder="Buscar recetas..."
            value={search}
          />

          <Text style={styles.sectionTitle}>Categorías</Text>
          <ScrollView
            contentContainerStyle={styles.categoriesContainer}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {CATEGORIES.map((category) => (
              <CategoryCard key={category.id} imageUrl={category.imageUrl} title={category.name} />
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Recetas populares</Text>
          <View style={styles.recipesContainer}>
            {POPULAR_RECIPES.map((recipe) => (
              <RecipeListItem
                imageUrl={recipe.imageUrl}
                isFavorite={recipe.isFavorite}
                key={recipe.id}
                onPress={() => rootNavigation.navigate('RecipeDetail', { recipeId: recipe.id })}
                rating={recipe.rating}
                title={recipe.name}
              />
            ))}
          </View>
        </ScrollView>

        <BottomTabBar activeTab="home" bottomInset={insets.bottom} onTabPress={handleTabPress} />
        <FloatingButton bottomInset={insets.bottom} onPress={() => navigation.navigate('AddTab')} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 31,
    color: '#C9822B',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 28,
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
});
