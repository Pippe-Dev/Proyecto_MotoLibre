import type { Product } from "../types/detailedProduct";

//const API_URL = "http://localhost:3000/api";

const mockProducts: Product[] = [
{
  id: 15,
  name: "Protector de motor",
  price: 250000,
  description: "Protector de motor tipo pechera, fabricado en acero de alta resistencia. Diseñado para motocicletas Honda XR150.",
  images: [
    "/images/honda/protector-honda-xr.jpg",
    "/images/honda/slider-honda-xr.jpg"
  ],
  stock: 12
},
  {
    id: 16,
    name: "Defensa lateral",
    price: 180000,
    description: "Defensa lateral de alta resistencia para motocicleta.",
    images: [
      "/images/honda/Pechera.webp"
    ],
    stock: 0
  },
  {
    id: 17,
    name: "Parrilla trasera",
    price: 150000,
    description: "Parrilla trasera para instalación de accesorios y equipaje.",
    images: [
    "/images/honda/protector-honda-xr.jpg",
    "/images/honda/slider-honda-xr.jpg"
  ],
    stock: 3
  },
  {
    id: 18,
    name: "Slider de motor",
    price: 95000,
    description: "Sliders de protección para motor y chasis, con tope de nylon de alta densidad. Ayudan a evitar daños en caídas a baja velocidad.",
    images: [
      "/images/honda/slider-honda-xr.jpg",
      "/images/honda/protector-honda-xr.jpg"
    ],
    stock: 8
  },
  {
    id: 19,
    name: "Pechera reforzada",
    price: 210000,
    description: "Pechera reforzada en acero con acabado en pintura electrostática negra. Instalación sin modificaciones.",
    images: [
      "/images/honda/Pechera.webp"
    ],
    stock: 5
  },
  {
    id: 20,
    name: "Protector de tanque",
    price: 75000,
    description: "Protector para tanque de combustible que previene rayones y golpes durante la conducción off-road.",
    images: [
      "/images/honda/protector-honda-xr.jpg"
    ],
    stock: 15
  },
  {
    id: 21,
    name: "Guardabarros delantero",
    price: 120000,
    description: "Guardabarros delantero resistente a impactos, con ajuste preciso para suspensiones de horquilla convencional.",
    images: [
      "/images/honda/Pechera.webp",
      "/images/honda/slider-honda-xr.jpg"
    ],
    stock: 0
  },
  {
    id: 22,
    name: "Manubrio de aluminio",
    price: 165000,
    description: "Manubrio de aluminio ligero y resistente, con diseño ergonómico para mayor control y comodidad.",
    images: [
      "/images/honda/slider-honda-xr.jpg"
    ],
    stock: 6
  },
  {
    id: 23,
    name: "Cubre cadena",
    price: 68000,
    description: "Protector de cadena de transmisión que reduce el desgaste y evita que la suciedad llegue al sistema.",
    images: [
      "/images/honda/protector-honda-xr.jpg",
      "/images/honda/Pechera.webp"
    ],
    stock: 10
  },
];

export async function getProducts(): Promise<Product[]> {
  return mockProducts;
}

export async function getProductById(
  id: number
): Promise<Product> {

  /*const response = await fetch(
    `${API_URL}/productos/${id}`
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener el producto");
  }

  const product: Product = await response.json();

  return product;*/
  const product = mockProducts.find(
    (product) => product.id === id
  );

  if (!product) {
    throw new Error("Producto no encontrado");
  }

  return product;
}