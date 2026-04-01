import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONT_SIZE, LAYOUT, SPACING } from '../constants/theme';
import { LocationPoint } from '../types';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'IngredientLocations'>;

type NavigationApp = {
  key: string;
  label: string;
  url: string;
};

const buildNavigationApps = (location: LocationPoint): NavigationApp[] => {
  const latLng = `${location.latitude},${location.longitude}`;
  const encodedAddress = encodeURIComponent(location.address);

  const apps: NavigationApp[] = [
    {
      key: 'google',
      label: 'Google Maps',
      url: `google.navigation:q=${latLng}`,
    },
    {
      key: 'waze',
      label: 'Waze',
      url: `waze://?ll=${latLng}&navigate=yes`,
    },
    {
      key: 'apple',
      label: 'Maps',
      url: `http://maps.apple.com/?daddr=${latLng}&q=${encodedAddress}`,
    },
    {
      key: 'geo',
      label: 'App de mapas',
      url: `geo:${latLng}?q=${latLng}(${encodedAddress})`,
    },
  ];

  if (Platform.OS === 'ios') {
    return [apps[2], apps[0], apps[1]];
  }

  return [apps[0], apps[1], apps[3]];
};

const getFallbackGoogleMapsUrl = (location: LocationPoint): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;

const openBestNavigationApp = async (location: LocationPoint): Promise<void> => {
  const apps = buildNavigationApps(location);

  for (const app of apps) {
    if (await Linking.canOpenURL(app.url)) {
      await Linking.openURL(app.url);
      return;
    }
  }

  await Linking.openURL(getFallbackGoogleMapsUrl(location));
};

export const IngredientLocationsScreen = ({ navigation, route }: Props) => {
  const { ingredientName, locations } = route.params;

  const mapCenter = useMemo(() => {
    if (!locations.length) {
      return {
        latitude: 18.4861,
        longitude: -69.9312,
      };
    }

    const latitudes = locations.map((location) => location.latitude);
    const longitudes = locations.map((location) => location.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
    };
  }, [locations]);

  const mapHtml = useMemo(() => {
    const serializedLocations = JSON.stringify(locations).replace(/</g, '\\u003c');

    return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      crossorigin=""
    />
    <style>
      html, body, #map { height: 100%; margin: 0; padding: 0; }
      body { background: #f5f5f5; }
      .leaflet-container { font-family: sans-serif; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script>
      const locations = ${serializedLocations};
      const center = { lat: ${mapCenter.latitude}, lng: ${mapCenter.longitude} };

      const map = L.map('map', { zoomControl: true }).setView([center.lat, center.lng], locations.length > 1 ? 8 : 13);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const markers = [];

      locations.forEach((location, index) => {
        const marker = L.marker([location.latitude, location.longitude]).addTo(map);
        marker.bindPopup('<strong>Punto ' + (index + 1) + '</strong><br/>' + location.address);
        marker.on('click', () => {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'location-press', index }));
        });
        markers.push(marker);
      });

      if (markers.length > 1) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.2));
      }
    </script>
  </body>
</html>`;
  }, [locations, mapCenter.latitude, mapCenter.longitude]);

  const openNavigationOptions = (location: LocationPoint) => {
    Alert.alert(
      'Ir a ubicacion',
      `Quieres ir a ${location.address}?`,
      [
        {
          text: 'Ir',
          onPress: async () => {
            try {
              await openBestNavigationApp(location);
            } catch {
              Alert.alert('Error', 'No se pudo abrir una app de mapas en este dispositivo.');
            }
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel' as const,
        },
      ],
    );
  };

  const renderLocationItem = ({ item, index }: { item: LocationPoint; index: number }) => (
    <Pressable onPress={() => openNavigationOptions(item)} style={styles.locationCard}>
      <View style={styles.locationCardHeader}>
        <View style={styles.locationIndexBadge}>
          <Text style={styles.locationIndexText}>{index + 1}</Text>
        </View>
        <View style={styles.locationCardBody}>
          <Text style={styles.locationAddress}>{item.address}</Text>
          <Text style={styles.locationCoordinates}>
            {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
          </Text>
        </View>
        <Ionicons color={COLORS.primary} name="navigate" size={18} />
      </View>
    </Pressable>
  );

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as { type?: string; index?: number };

      if (payload.type !== 'location-press' || typeof payload.index !== 'number') {
        return;
      }

      const selectedLocation = locations[payload.index];

      if (!selectedLocation) {
        return;
      }

      openNavigationOptions(selectedLocation);
    } catch {
      // Ignore malformed messages from web content.
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons color={COLORS.textPrimary} name="arrow-back" size={22} />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Puntos de compra</Text>
          <Text style={styles.subtitle}>{ingredientName}</Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          source={{ html: mapHtml }}
          onMessage={handleWebViewMessage}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          style={styles.webview}
        />
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderTitle}>Ubicaciones ({locations.length})</Text>
        <Text style={styles.listHeaderHint}>Toca un punto o una tarjeta para navegar</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={locations}
        keyExtractor={(item, index) => `${item.address}-${index}`}
        renderItem={renderLocationItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons color={COLORS.textSecondary} name="location-outline" size={42} />
            <Text style={styles.emptyStateText}>No hay ubicaciones para este ingrediente.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.contentHorizontalPadding,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    marginTop: 2,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  mapContainer: {
    marginTop: SPACING.xs,
    marginHorizontal: LAYOUT.contentHorizontalPadding,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 260,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
  },
  listHeader: {
    marginTop: SPACING.md,
    marginHorizontal: LAYOUT.contentHorizontalPadding,
  },
  listHeaderTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  listHeaderHint: {
    marginTop: 2,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: LAYOUT.contentHorizontalPadding,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  locationCard: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  locationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  locationIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.softPrimary,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationIndexText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  locationCardBody: {
    flex: 1,
  },
  locationAddress: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  locationCoordinates: {
    marginTop: 2,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
  },
  emptyState: {
    paddingTop: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
});
