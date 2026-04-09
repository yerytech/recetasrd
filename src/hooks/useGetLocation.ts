import * as Location from 'expo-location';
import { useState } from 'react';

export interface CurrentCoordinates {
  latitude: number;
  longitude: number;
}

interface GetLocationResult {
  coords: CurrentCoordinates | null;
  errorMessage?: string;
}

/**
 * Hook para solicitar permisos y obtener la ubicacion actual del dispositivo.
 */
export const useGetLocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<CurrentCoordinates | null>(null);

  const getLocation = async (): Promise<GetLocationResult> => {
    try {
      setIsLoading(true);

      // Solo pide permiso en primer plano.
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permiso de ubicación denegado');
        return {
          coords: null,
          errorMessage: 'Permiso de ubicación denegado',
        };
      }

      // Obtener ubicación actual.
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });

      if (!currentLocation?.coords) {
        return {
          coords: null,
          errorMessage: 'No se recibieron coordenadas',
        };
      }

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(coords);

      return {
        coords,
      };
    } catch (error: unknown) {
      console.log('Error al obtener la ubicación:', error);
      return {
        coords: null,
        errorMessage: error instanceof Error ? error.message : 'Error al obtener la ubicación',
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getLocation,
    location,
    isLoading,
  };
};
