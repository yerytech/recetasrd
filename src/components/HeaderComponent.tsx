import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderComponentProps {
  title: string;
  subtitle: string;
  showBackButton?: boolean;
}

export const HeaderComponent = ({
  title,
  subtitle,
  showBackButton = true,
}: HeaderComponentProps) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }] }>
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          {showBackButton && (
            <Pressable onPress={handleBackPress} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </Pressable>
          )}
          <Text style={styles.title}>{title}</Text>
          <View style={styles.spacer} />
        </View>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.roundedBottom} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#C47F2A',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerContent: {
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    width: 44,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 20,
    marginTop: 8,
  },
  roundedBottom: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#C47F2A',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});
