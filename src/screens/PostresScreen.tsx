import { NavigationProp, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FoodCard } from '../components/FoodCard';
import { HeaderComponent } from '../components/HeaderComponent';
import { POSTRES_FOODS } from '../constants/foodData';
import { RootStackParamList } from '../navigation/types';

export const PostresScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const renderItem = ({ item }: any) => (
    <View style={styles.cardWrapper}>
      <FoodCard
        title={item.name}
        rating={item.rating}
        imageUrl={item.imageUrl}
        onPress={() =>
          navigation.navigate('RecipeDetail', {
            recipeId: item.id,
            localRecipe: {
              id: item.id,
              title: item.name,
              category: 'Postres',
              imageUrl: item.imageUrl,
              rating: item.rating,
              ingredients: item.ingredients ?? ['Ingredientes al gusto'],
              preparation: item.preparation ?? 'Preparación no disponible por el momento.',
            },
          })
        }
      />
    </View>
  );

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <StatusBar style="dark" />
      <HeaderComponent
        title="Postres"
        subtitle="Porque siempre hay espacio para algo dulce... un postre que endulce tu día y te saque una sonrisa."
        showBackButton={true}
      />

      <FlatList
        data={POSTRES_FOODS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        scrollIndicatorInsets={{ right: 1 }}
        showsVerticalScrollIndicator={false}
      />
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
});
