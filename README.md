# Recetas RD

Aplicación móvil enfocada en recetas tradicionales dominicanas. El objetivo es ofrecer una experiencia sencilla, visual e interactiva para explorar platos típicos, conocer ingredientes, seguir pasos de preparación y facilitar la compra de insumos necesarios.

## 1. Introducción

**Recetas RD** es una aplicación móvil diseñada para acercar la gastronomía dominicana a cualquier usuario desde su dispositivo. La plataforma permite:

- Explorar recetas tradicionales.
- Consultar ingredientes y preparación paso a paso.
- Interactuar mediante calificaciones y comentarios.
- Organizar la compra de ingredientes.

## 2. Objetivos del Proyecto

### Objetivo general

Desarrollar una aplicación móvil que permita a los usuarios consultar, guardar y preparar recetas dominicanas de manera fácil e interactiva.

### Objetivos específicos

- Mostrar una lista de recetas organizadas por categorías.
- Permitir el registro e inicio de sesión de usuarios.
- Mostrar ingredientes y pasos de preparación por receta.
- Permitir calificar y comentar recetas.
- Generar una lista de compras con los ingredientes necesarios.
- Mostrar la ubicación de tiendas cercanas para comprar ingredientes.

## 3. Descripción de la Aplicación

La aplicación está enfocada en facilitar el acceso a recetas tradicionales dominicanas mediante una interfaz amigable e intuitiva.

Funciones principales:

- Visualización de recetas populares.
- Clasificación por categorías (desayuno, almuerzo, cena y postres).
- Sistema de calificación y comentarios.
- Lista de compras de ingredientes.
- Ubicación de tiendas cercanas.

## 4. Módulos de la Aplicación

- **Pantalla de Bienvenida:** primera vista con el logo de Recetas RD.
- **Login (Inicio de Sesión):** acceso con correo y contraseña, con opción de cuentas externas.
- **Registro de Usuario:** creación de cuenta con correo, contraseña y confirmación.
- **Pantalla Principal (Home):**
	- Barra de búsqueda de recetas.
	- Categorías de comida.
	- Recetas populares.
	- Navegación rápida entre secciones.
- **Detalles de Receta:**
	- Imagen del plato.
	- Calificación.
	- Ingredientes.
	- Pasos de preparación.
	- Botón para video.
	- Botón para agregar ingredientes a la lista de compra.
- **Sistema de Calificaciones:** estrellas y comentarios por receta.
- **Ubicación de Tiendas:** mapa con tiendas cercanas para adquirir ingredientes.
- **Lista de Compras:** consolidación de ingredientes de recetas seleccionadas.
- **Agregar Recetas:** formulario para crear nuevas recetas con nombre, categoría, imagen, ingredientes, preparación y ubicación de tienda.

## 5. Diseño de Interfaz

Se desarrolló un prototipo inicial para definir funcionalidades y pantallas principales. Luego, se realizó un rediseño para mejorar la experiencia de usuario con:

- Colores cálidos relacionados con cocina.
- Mejor organización visual de elementos.
- Diseño moderno y limpio.
- Iconografía y navegación optimizadas.

## 6. Tecnologías Utilizadas

- **Diseño de interfaz:** Figma.
- **Desarrollo móvil:** React Native (multiplataforma Android/iOS).
- **Entorno de desarrollo:** Visual Studio Code.
- **Gestión de dependencias:** Node.js y npm.
- **Control de versiones:** Git y GitHub.
- **Gestión del proyecto:** Jira.
- **Backend:** Supabase (Auth + Postgres + RLS).
- **Base de datos:** PostgreSQL (gestionada por Supabase).

## 7. Metodología de Trabajo

El proyecto se desarrolla en equipo, con responsabilidades distribuidas entre los integrantes para cubrir diseño, desarrollo, pruebas, documentación y seguimiento de tareas.

## Estado del Proyecto

Actualmente este repositorio contiene la base de la app móvil en Expo + React Native.

## Ejecución Local

### Requisitos

- Node.js (LTS recomendado).
- npm.
- Expo Go (opcional para pruebas en dispositivo físico).

### Instalación

```bash
npm install
```

### Configurar Supabase

1. Copia el archivo de ejemplo de entorno:

```bash
cp .env.example .env
```

2. Completa en `.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

3. Ejecuta la migración SQL de `supabase/migrations/20260322_init_recetas_rd.sql` en tu proyecto Supabase.

Guía completa en: `docs/SUPABASE_SETUP.md`.

### Iniciar el proyecto

```bash
npm run start
```

### Ejecutar por plataforma

```bash
npm run android
npm run ios
npm run web
```

## Estructura Inicial

```text
recetas_rd/
├── App.tsx
├── app.json
├── index.ts
├── package.json
├── tsconfig.json
└── assets/
```

## Autoría

Proyecto académico: **Recetas RD**.
