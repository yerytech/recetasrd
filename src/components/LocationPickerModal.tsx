import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: { address: string; coordinates: Coordinates }) => void;
}

export const LocationPickerModal = ({
  visible,
  onClose,
  onSelectLocation,
}: LocationPickerModalProps) => {
  const [region, setRegion] = useState<any>(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [fetchingAddress, setFetchingAddress] = useState(false);

  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    }
  }, [visible]);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Se necesita permiso de ubicación. Puedes seleccionar una ubicación manualmente en el mapa.',
        );
        // Fallback to Santo Domingo, DR
        setDefaultLocation();
        return;
      }

      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeoutMs: 10000, // 10 second timeout
        });
        const { latitude, longitude } = currentLocation.coords;

        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        setSelectedCoordinates({ latitude, longitude });
        await reverseGeocode(latitude, longitude);
      } catch (locationError: any) {
        console.error('Error getting location:', locationError?.message);
        
        // Location services error - provide helpful message
        if (locationError?.message?.includes('unavailable')) {
          Alert.alert(
            'Ubicación no disponible',
            'Asegúrate de:\n• Habilitar servicios de ubicación en tu dispositivo\n• En el emulador: abre Extended controls → Location\n\nPuedes seleccionar manualmente en el mapa.',
          );
        } else {
          Alert.alert(
            'Error de ubicación',
            'No se pudo obtener tu ubicación. Selecciona una en el mapa manualmente.',
          );
        }
        
        // Fallback to Santo Domingo, DR
        setDefaultLocation();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado.');
      setDefaultLocation();
    }
  };

  const setDefaultLocation = () => {
    const defaultLatitude = 18.4861;
    const defaultLongitude = -69.9312;
    
    setRegion({
      latitude: defaultLatitude,
      longitude: defaultLongitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
    
    setSelectedCoordinates({
      latitude: defaultLatitude,
      longitude: defaultLongitude,
    });
    
    setAddress('Santo Domingo, República Dominicana');
    setLoading(false);
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      setFetchingAddress(true);
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode.length > 0) {
        const { name, street, city, region } = geocode[0];
        const fullAddress = `${street || name || ''}, ${city || ''}, ${region || ''}`.replace(
          /^, |, $/g,
          '',
        );
        setAddress(fullAddress || 'Ubicación seleccionada');
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setAddress('Ubicación seleccionada');
    } finally {
      setFetchingAddress(false);
    }
  };

  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedCoordinates({ latitude, longitude });
    await reverseGeocode(latitude, longitude);
  };

  const handleConfirmLocation = () => {
    if (!selectedCoordinates) {
      Alert.alert('Error', 'Por favor selecciona una ubicación');
      return;
    }

    onSelectLocation({
      address: address || 'Ubicación seleccionada',
      coordinates: selectedCoordinates,
    });

    onClose();
  };

  if (!visible) return null;

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent={false} visible={visible}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Selecciona una ubicación</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
          </View>
        ) : (
          <>
            {region && (
              <MapView
                initialRegion={region}
                onPress={handleMapPress}
                style={styles.map}
              >
                {selectedCoordinates && (
                  <Marker
                    coordinate={selectedCoordinates}
                    pinColor={COLORS.primary}
                    title="Ubicación seleccionada"
                  />
                )}
              </MapView>
            )}

            <View style={styles.bottomSheet}>
              {fetchingAddress && <ActivityIndicator color={COLORS.primary} />}

              <Text style={styles.addressLabel}>Dirección:</Text>
              <Text style={styles.addressText}>{address}</Text>

              {selectedCoordinates && (
                <Text style={styles.coordinatesText}>
                  Lat: {selectedCoordinates.latitude.toFixed(6)}, Lon:{' '}
                  {selectedCoordinates.longitude.toFixed(6)}
                </Text>
              )}

              <Pressable
                onPress={getCurrentLocation}
                style={[styles.button, styles.buttonSecondary]}
              >
                <Ionicons color={COLORS.primary} name="locate" size={20} />
                <Text style={styles.buttonSecondaryText}>Mi ubicación actual</Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmLocation}
                style={[styles.button, styles.buttonPrimary]}
              >
                <Text style={styles.buttonText}>Confirmar ubicación</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  addressLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  addressText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  coordinatesText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  button: {
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.softPrimary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
