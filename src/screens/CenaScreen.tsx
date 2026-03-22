import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FoodCard } from '../components/FoodCard';
import { HeaderComponent } from '../components/HeaderComponent';
import { CENA_FOODS } from '../constants/foodData';

export const CenaScreen = () => {
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
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <StatusBar style="dark" />
      <HeaderComponent
        title="Cena"
        subtitle="La mejor manera de terminar el día es con una cena deliciosa que reconforte el corazón y el alma."
        showBackButton={true}
      />

      <FlatList
        data={CENA_FOODS}
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
