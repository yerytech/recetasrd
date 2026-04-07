# Recetas RD

Aplicacion movil de recetas dominicanas construida con Expo + React Native + TypeScript.

## Funcionalidades principales

- Autenticacion con Supabase (con fallback local cuando no hay configuracion).
- Explorar recetas por categoria (Desayuno, Almuerzo, Cena, Postres).
- Buscar recetas por texto.
- Crear y editar recetas con imagen, ingredientes y preparacion.
- Calificar y comentar recetas.
- Agregar ingredientes a lista de compras persistente.
- Guardar multiples ubicaciones por ingrediente (`purchaseLocations`).
- Ver ubicaciones en mapa OpenStreetMap (sin API key de Google).
- Abrir navegacion con la app de mapas instalada (Google Maps, Waze, Maps, etc.).

## Stack

- Expo 55
- React Native 0.83
- TypeScript
- React Navigation
- Supabase (Auth + Postgres + RLS)
- AsyncStorage
- react-native-webview (mapa OpenStreetMap en pantalla de ubicaciones)

## Requisitos

- Node.js LTS
- npm
- Android Studio / Xcode (si usaras build nativo)

## Instalacion

```bash
npm install
```

## Variables de entorno

1. Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

2. Completa en `.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## Base de datos (Supabase)

Confidencialidad: la informacion de la base de datos es sensible. No compartas credenciales, URL del proyecto, claves anon/service role, ni respaldos con datos reales fuera del equipo autorizado.

## Ejecutar la app

```bash
npm run start
```

### Por plataforma

```bash
npm run android
npm run ios
npm run web
```

Si agregaste dependencias nativas nuevas (por ejemplo `react-native-webview`), recompila la app nativa:

```bash
npx expo run:android
# o
npx expo run:ios
```

## Flujo de ubicaciones de ingredientes

1. En crear/editar receta, cada ingrediente puede tener varias ubicaciones.
2. En lista de compras, boton `Ver ubicaciones` abre el mapa de ese ingrediente.
3. Al tocar un punto o tarjeta de ubicacion, aparece alerta con:
- `Ir`
- `Cancelar`
4. `Ir` abre automaticamente una app de mapas instalada.

## Estructura (resumen)

```text
src/
	components/
	constants/
	context/
	hooks/
	navigation/
	screens/
	services/
	types/
	utils/
supabase/
	migrations/
	seed.sql
	reseed_multi_locations.sql
```
## Prototipo en Figma

Puedes visualizar el diseño de la aplicación en el siguiente enlace:

https://www.figma.com/design/27ba0MGRaKlEjGpGIdCGAP/Recetas?node-id=0-1&t=9HBR5WbIXvlaRIhS-1
