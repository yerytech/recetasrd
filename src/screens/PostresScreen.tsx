import { useNavigation } from '@react-navigation/native';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FoodCard } from '../components/FoodCard';
import { HeaderComponent } from '../components/HeaderComponent';
import { POSTRES_FOODS } from '../constants/foodData';

export const PostresScreen = () => {
  const navigation = useNavigation();

  const renderItem = ({ item }: any) => (
    <View style={styles.cardWrapper}>
      <FoodCard
        title={item.name}
        rating={item.rating}
        imageUrl={item.imageUrl}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
    paddingHorizontal: 12,
    gap: 12,
    marginBottom: 12,
  },
  cardWrapper: {
    flex: 1,
    minHeight: 240,
  },
  listContent: {
    paddingTop: 20,
    paddingHorizontal: 0,
  },
});
