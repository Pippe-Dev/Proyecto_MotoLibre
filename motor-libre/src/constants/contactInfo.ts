// Datos de contacto de la tienda que se muestran en la página "Contáctenos".
// IMPORTANTE: son valores de ejemplo. Reemplázalos por los datos reales.

export interface ContactItem {
  icon: string; // clase de Bootstrap Icons
  label: string;
  value: string;
  href?: string; // si existe, el valor se muestra como enlace
}

export const CONTACT_ITEMS: ContactItem[] = [
  {
    icon: "bi-geo-alt-fill",
    label: "Dirección",
    value: "Medellin, Antioquia",
  },
  {
    icon: "bi-telephone-fill",
    label: "Teléfono / WhatsApp",
    value: "+57 300 000 0000",
    href: "tel:+573000000000",
  },
  {
    icon: "bi-envelope-fill",
    label: "Correo",
    value: "contacto@motorlibre.example",
    href: "mailto:contacto@motorlibre.com",
  },
  {
    icon: "bi-clock-fill",
    label: "Horario de atención",
    value: "Lunes a sábado, 8:00 a. m. a 6:00 p. m.",
  },
];
