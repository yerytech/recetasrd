# Documentación: Implementación de Compartir Recetas con Deep Linking

## 📋 Resumen General
Se implementó un sistema de compartir recetas que permite a los usuarios compartir un link que abre la receta directamente en la app si ya está instalada. Esto incluye un botón flotante elegante y configuración de deep linking.

---

## 📝 Cambios Detallados por Archivo

### 1. **app.json** - Configuración de Scheme

#### Línea agregada (después de `"web"` y antes del cierre final):
```json
"scheme": "recetasrd"
```

**Ubicación exacta:** Después de la sección `"web"`, antes del último `}`

**Explicación:**
- `"scheme"` define un protocolo personalizado para tu app
- Permite que URLs como `recetasrd://recipe/123` abran tu aplicación
- Es similar a cómo `mailto://` abre el email o `tel://` abre el teléfono
- Android e iOS requieren esto registrado en `app.json` para funcionr

---

### 2. **src/navigation/RootNavigator.tsx** - Configuración del Deep Linking

#### 2.1 - Import agregado (línea 1):
```typescript
import { LinkingOptions } from '@react-navigation/native';
```

**Cambio en la línea de import original:**
```typescript
// ANTES:
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';

// DESPUÉS:
import { DefaultTheme, NavigationContainer, LinkingOptions } from '@react-navigation/native';
```

**Explicación:**
- `LinkingOptions` es un tipo de TypeScript que permite definir rutas de deep linking
- Se importa de `@react-navigation/native`

---

#### 2.2 - Nueva configuración de linking (después de `navTheme`):
```typescript
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['recetasrd://', 'https://recetasrd.app'],
  config: {
    screens: {
      RecipeDetail: 'recipe/:recipeId',
      App: '',
      Desayuno: 'desayuno',
      Almuerzo: 'almuerzo',
      Cena: 'cena',
      Postres: 'postres',
      Auth: 'auth',
    },
  },
};
```

**Explicación línea por línea:**
- `const linking: LinkingOptions<RootStackParamList> = {`
  - Define una constante de tipo `LinkingOptions` para las pantallas
  
- `prefixes: ['recetasrd://', 'https://recetasrd.app']`
  - Acepta URLs que comienzan con estos prefijos
  - `recetasrd://` es el scheme de la app
  - `https://recetasrd.app` es para links web

- `RecipeDetail: 'recipe/:recipeId'`
  - Mapea `recetasrd://recipe/123` → Pantalla RecipeDetail con parámetro `recipeId=123`
  - El `:recipeId` es un parámetro dinámico extraído de la URL

- Las otras líneas mapean otras pantallas a sus rutas

---

#### 2.3 - Cambio en NavigationContainer (línea del return):
```typescript
// ANTES:
<NavigationContainer theme={navTheme}>

// DESPUÉS:
<NavigationContainer theme={navTheme} linking={linking} fallback={<SplashScreen />}>
```

**Explicación:**
- `linking={linking}` - Le dice a NavigationContainer que use la configuración de rutas definida
- `fallback={<SplashScreen />}` - Muestra SplashScreen mientras procesa el deep link

---

### 3. **src/screens/RecipeDetailScreen.tsx** - Botón y Función de Compartir

#### 3.1 - Import agregado en la sección de imports:
```typescript
import { Share } from 'react-native';
```

**Cambio en imports:**
```typescript
// ANTES:
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// DESPUÉS:
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
```

**Explicación:**
- `Share` es un módulo de React Native que abre el selector nativo de compartir
- Permite acceder a WhatsApp, email, Telegram, etc.

---

#### 3.2 - nueva función `handleShare` (después de `handleDeleteRecipe`):
```typescript
const handleShare = async () => {
  if (!recipe) {
    return;
  }

  try {
    const deepLink = `recetasrd://recipe/${recipe.id}`;
    const shareMessage = `¡Descubre "${recipe.title}" en RecetasRD!\n\n📱 Abre la app y visualiza esta deliciosa receta con todos los ingredientes y la preparación paso a paso.\n\n¡Es muy fácil!`;

    await Share.share({
      message: shareMessage,
      title: recipe.title,
      url: deepLink,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo compartir la receta.';
    Alert.alert('Error', message);
  }
};
```

**Explicación línea por línea:**

- `const handleShare = async () => {`
  - Define función asincrónica para manejar el compartir

- `if (!recipe) { return; }`
  - Verifica que exista una receta antes de compartir

- `const deepLink = `recetasrd://recipe/${recipe.id}`;`
  - Crea el deep link dinámico con el ID de la receta
  - Ejemplo: `recetasrd://recipe/123`

- `const shareMessage = ...`
  - Mensaje atractivo que se muestra en el selector de compartir

- `await Share.share({...})`
  - Abre el selector nativo del sistema (WhatsApp, email, etc.)
  - `message` - Texto que se comparte
  - `title` - Título de la acción
  - `url` - El deep link (algunos apps lo usan como enlace)

- `catch (error) { Alert.alert(...) }`
  - Maneja errores si algo falla en el compartir

---

#### 3.3 - Botón flotante agregado (antes del cierre del return):
```typescript
<Pressable onPress={handleShare} style={({ pressed }) => [styles.shareButton, pressed && styles.shareButtonPressed]}>
  <Ionicons color="#FFFFFF" name="share-social" size={24} />
</Pressable>
```

**Ubicación:** Dentro de `<SafeAreaView>` pero DESPUÉS de `</ScrollView>` y ANTES de `</SafeAreaView>`

**Explicación:**
- `<Pressable onPress={handleShare} ...>`
  - Botón presionable que ejecuta `handleShare` al tocarse

- `style={({ pressed }) => [...]}`
  - Aplica estilos diferentes cuando está presionado

- `styles.shareButton` - Estilo base del botón
- `pressed && styles.shareButtonPressed` - Estilo cuando está presionado (opacidad y escala)

- `<Ionicons ... name="share-social" size={24} />`
  - Icono de compartir de Ionicons en color blanco

---

#### 3.4 - Estilos del botón agregados (en `StyleSheet.create()`):
```typescript
shareButton: {
  position: 'absolute',
  bottom: SPACING.lg,
  right: SPACING.lg,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: COLORS.primary,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
},
shareButtonPressed: {
  opacity: 0.9,
  transform: [{ scale: 0.95 }],
},
```

**Explicación:**

**`shareButton` (Estilo base):**
- `position: 'absolute'` - Se posiciona sobre otros elementos
- `bottom: SPACING.lg` y `right: SPACING.lg` - En la esquina inferior derecha
- `width: 56, height: 56` - Botón cuadrado de 56x56 píxeles
- `borderRadius: 28` - Hace que sea circular (radio = mitad del ancho)
- `backgroundColor: COLORS.primary` - Color naranja de la app
- `alignItems: 'center', justifyContent: 'center'` - Centra el icono
- `shadowColor: '#000000'` - Color de la sombra (negro)
- `shadowOffset: { width: 0, height: 4 }` - Sombra hacia abajo
- `shadowOpacity: 0.3` - Transparencia de la sombra (30%)
- `shadowRadius: 8` - Difuminado de la sombra
- `elevation: 8` - Para Android (profundidad 8)

**`shareButtonPressed` (Estilo al presionar):**
- `opacity: 0.9` - Reduce opacidad al 90% cuando se presiona
- `transform: [{ scale: 0.95 }]` - Reduce el tamaño al 95% (efecto de "click")

---

## 🔄 Flujo Completo del Funcionamiento

```
1. Usuario presiona botón flotante
   ↓
2. Se ejecuta handleShare()
   ↓
3. Se crea deep link: recetasrd://recipe/123
   ↓
4. Se muestra selector nativo (WhatsApp, Email, etc.)
   ↓
5. Usuario elige dónde compartir
   ↓
6. Texto + Link se envía a otra persona
   ↓
7. Otra persona presiona el link
   ↓
8. Si tiene la app:
   - Android/iOS reconoce scheme "recetasrd://"
   - Abre la app automáticamente
   - RootNavigator procesa el linking
   - RecipeDetail recibe el recipeId
   - Se abre la pantalla elegante de la receta
   ↓
9. Si NO tiene la app:
   - Solo ve el mensaje (fallback)
```

---

## 📊 Resumen de Cambios

| Archivo | Cambios | Líneas |
|---------|---------|--------|
| app.json | 1 línea agregada (scheme) | 1 |
| RootNavigator.tsx | 1 import + 1 config + 1 prop en NavigationContainer | 25 aprox |
| RecipeDetailScreen.tsx | 1 import + 1 función + 1 botón JSX + 2 estilos | 35 aprox |

**Total de código nuevo: ~70 líneas**

---

## ✅ Validación

Para verificar que todo está funcionando:

1. Compila la app: `npx expo run:android -d`
2. Ve a una receta
3. Presiona el botón flotante naranja (inferior derecha)
4. Comparte por WhatsApp o email
5. Si otro dispositivo con la app abre el link, debería abrir esa receta

---
