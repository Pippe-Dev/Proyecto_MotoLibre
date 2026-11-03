export interface ReservationStatusOption {
  value: "activo" | "exitoso" | "eliminado";
  label: "Pagado" | "Entregado" | "Cancelado";
}

export const RESERVATION_STATUS_OPTIONS: ReservationStatusOption[] = [
  { value: "activo", label: "Pagado" },
  { value: "exitoso", label: "Entregado" },
  { value: "eliminado", label: "Cancelado" },
];

export function getReservationStatusLabel(value: string): string {
  return (
    RESERVATION_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}
