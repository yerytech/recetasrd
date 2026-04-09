import { NavigationProp, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FoodCard } from '../components/FoodCard';
import { HeaderComponent } from '../components/HeaderComponent';
import { LoadingStateCard } from '../components/LoadingStateCard';
import { useRecipes } from '../hooks/useRecipes';
import { RootStackParamList } from '../navigation/types';
import { getResponsiveColumns, getResponsiveMaxWidth } from '../utils/responsive';

export const AlmuerzoScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { recipes, isLoading, error } = useRecipes({ initialCategory: 'Almuerzo' });
  const { width } = useWindowDimensions();
  const numColumns = getResponsiveColumns(width);
  const contentMaxWidth = getResponsiveMaxWidth(width, 640, 1200);

  const almuerzos = recipes;

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
        title="Almuerzo"
        subtitle="Nada mejor que una pausa en el día para disfrutar un almuerzo delicioso, preparado con amor y sabor."
        showBackButton={true}
      />

      {isLoading ? (
        <LoadingStateCard title="Cargando recetas" subtitle="Buscando opciones de almuerzo para ti." />
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : almuerzos.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No hay almuerzos disponibles</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={almuerzos}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            key={`almuerzo-grid-${numColumns}`}
            numColumns={numColumns}
            {...(numColumns > 1 ? { columnWrapperStyle: styles.columnWrapper } : {})}
            contentContainerStyle={styles.listContent}
            scrollIndicatorInsets={{ right: 1 }}
            showsVerticalScrollIndicator={false}
            style={[styles.list, { maxWidth: contentMaxWidth }]}
          />
        </View>
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
  listContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
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
