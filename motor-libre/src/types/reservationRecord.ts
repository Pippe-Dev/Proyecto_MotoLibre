export interface ReservationRecord {
  id_reserva: number;
  nombre: string;
  documento: string;
  tipo_documento: string;
  correo: string;
  celular: string;
  id_producto: number;
  cantidad: number;
  estado: string;
  creado_en?: string;
  productos: {
    nombre: string;
    precio: number;
    imagen: string | null;
    existencias?: number;
  } | null;
}
