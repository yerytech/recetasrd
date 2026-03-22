import { NavigationProp, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FoodCard } from '../components/FoodCard';
import { HeaderComponent } from '../components/HeaderComponent';
import { useRecipes } from '../hooks/useRecipes';
import { RootStackParamList } from '../navigation/types';

export const CenaScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { recipes, isLoading, error } = useRecipes();

  // Filtrar solo cenas
  const cenas = recipes.filter(recipe => recipe.category === 'Cena');

  const renderItem = ({ item }: any) => (
    <View style={styles.cardWrapper}>
      <FoodCard
        title={item.title}
        rating={item.averageRating}
        imageUrl={item.imageUrl}
        onPress={() =>
          navigation.navigate('RecipeDetail', {
            recipeId: item.id,
          })
        }
      />
    </View>
  );

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <StatusBar style="dark" />
      <HeaderComponent
        title="Cena"
        subtitle="La mejor manera de terminar el día es con una cena deliciosa que reconforte el corazón y el alma."
        showBackButton={true}
      />

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#C9822B" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : cenas.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No hay cenas disponibles</Text>
        </View>
      ) : (
        <FlatList
          data={cenas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          scrollIndicatorInsets={{ right: 1 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  columnWrapper: {
    paddingHorizontal: 14,
    gap: 14,
    marginBottom: 14,
  },
  cardWrapper: {
    flex: 1,
    minHeight: 240,
    marginBottom: 4,
  },
  listContent: {
    paddingTop: 34,
    paddingHorizontal: 0,
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
});
