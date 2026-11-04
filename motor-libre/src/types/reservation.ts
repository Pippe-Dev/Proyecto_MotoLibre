export interface ReservationInput {
  nombre: string;
  documento: string;
  tipoDocumento: string;
  correo: string;
  celular: string;
  idProducto: number;
  cantidad: number;
}

export interface ReservationUpdateInput {
  cantidad?: number;
  correo?: string;
  celular?: string;
}

export interface ReservationBatchInput {
  nombre: string;
  documento: string;
  tipoDocumento: string;
  correo: string;
  celular: string;
  items: { idProducto: number; cantidad: number }[];
}
