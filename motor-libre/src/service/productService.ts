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
      "/images/honda/defensa-lateral-1.jpg",
      "/images/honda/defensa-lateral-2.jpg"
    ],
    stock: 0
  },
  {
    id: 17,
    name: "Parrilla trasera",
    price: 150000,
    description: "Parrilla trasera para instalación de accesorios y equipaje.",
    images: [
      "/images/parrilla.jpg"
    ],
    stock: 0
  },
];

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