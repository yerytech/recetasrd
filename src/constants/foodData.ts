export interface FoodItem {
  id: string;
  name: string;
  rating: number;
  imageUrl: string;
  ingredients?: string[];
  preparation?: string;
}

export const DESAYUNO_FOODS: FoodItem[] = [
  {
    id: 'des-1',
    name: 'Mangú Dominicano',
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80',
    ingredients: ['3 plátanos verdes', '1 cebolla roja', 'Mantequilla', 'Sal al gusto'],
    preparation:
      'Hierve los plátanos hasta ablandar, escúrrelos y machácalos con mantequilla y un poco de agua. Sofríe la cebolla y sirve por encima del mangú.',
  },
  {
    id: 'des-2',
    name: 'Tostada de jamón y queso',
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1528735602780-cf978f84c31f?auto=format&fit=crop&w=400&q=80',
    ingredients: ['2 rebanadas de pan', 'Jamón', 'Queso', 'Mantequilla'],
    preparation:
      'Unta mantequilla al pan, agrega jamón y queso y dora en sartén o sandwichera hasta que el queso se derrita.',
  },
  {
    id: 'des-3',
    name: 'Pancakes',
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=400&q=80',
    ingredients: ['1 taza de harina', '1 huevo', '3/4 taza de leche', '1 cdta de polvo de hornear'],
    preparation:
      'Mezcla todos los ingredientes hasta integrar. Cocina porciones en sartén caliente hasta dorar ambos lados.',
  },
  {
    id: 'des-4',
    name: 'Tostada Francesa',
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1484723492970-86db8006e671?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Pan de molde', '2 huevos', '1/2 taza de leche', 'Canela y vainilla'],
    preparation:
      'Bate huevos con leche y canela. Remoja el pan, cocina en sartén engrasada y sirve con miel o frutas.',
  },
];

export const ALMUERZO_FOODS: FoodItem[] = [
  {
    id: 'alm-1',
    name: 'Espaguetis con albondigas',
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Espaguetis', 'Carne molida', 'Salsa de tomate', 'Ajo y orégano'],
    preparation:
      'Forma albóndigas con la carne y cocínalas. Hierve la pasta, mezcla con salsa de tomate y sirve con las albóndigas.',
  },
  {
    id: 'alm-2',
    name: 'Sancocho de Guandules',
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Guandules', 'Yuca', 'Auyama', 'Cilantro y sazones'],
    preparation:
      'Sofríe sazones, agrega guandules y agua. Incorpora víveres y cocina a fuego medio hasta espesar el caldo.',
  },
  {
    id: 'alm-3',
    name: 'Pescado frito',
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Pescado limpio', 'Ajo', 'Limón', 'Harina y sal'],
    preparation:
      'Sazona el pescado con ajo, limón y sal. Enharina ligeramente y fríe hasta dorar por ambos lados.',
  },
  {
    id: 'alm-4',
    name: 'Camarones Empanizados',
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Camarones', 'Huevo', 'Pan rallado', 'Harina y sal'],
    preparation:
      'Pasa los camarones por harina, huevo y pan rallado. Fríe en aceite caliente hasta que queden crujientes.',
  },
];

export const CENA_FOODS: FoodItem[] = [
  {
    id: 'cen-1',
    name: 'Sushi',
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cen-2',
    name: 'Camarones a la crema con ajo',
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cen-3',
    name: 'Tacos',
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cen-4',
    name: 'Pizza de Peperoni',
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=400&q=80',
  },
];

export const POSTRES_FOODS: FoodItem[] = [
  {
    id: 'pos-1',
    name: 'Bizcocho de tres leches',
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Harina', 'Huevos', 'Leche evaporada', 'Leche condensada y crema'],
    preparation:
      'Hornea el bizcocho base, pincha la superficie y báñalo con la mezcla de tres leches. Refrigera antes de servir.',
  },
  {
    id: 'pos-2',
    name: 'Flan La Lechera y Carnation',
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1488477181946-6428a0291840?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Leche condensada', 'Leche evaporada', '4 huevos', 'Azúcar para caramelo'],
    preparation:
      'Prepara caramelo, vierte en molde. Licúa los demás ingredientes y cocina el flan a baño maría hasta cuajar.',
  },
  {
    id: 'pos-3',
    name: 'Arroz con dulce leche de coco',
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1586985289688-cacf313ca11e?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Arroz', 'Leche de coco', 'Leche evaporada', 'Canela y azúcar'],
    preparation:
      'Cocina el arroz con especias y agrega las leches. Remueve a fuego bajo hasta lograr una textura cremosa.',
  },
  {
    id: 'pos-4',
    name: 'Arepa de Maíz',
    rating: 4.9,
    imageUrl:
      'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Harina de maíz', 'Leche de coco', 'Azúcar', 'Mantequilla'],
    preparation:
      'Mezcla todo hasta obtener una masa suave. Hornea o cocina en sartén engrasada hasta dorar.',
  },
];
