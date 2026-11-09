import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface FavoritesContextType {
  favoriteIds: number[];
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (productId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = "motor-libre-favorites";

function getInitialFavorites(): number[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((id): id is number => typeof id === "number")
      : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<number[]>(getInitialFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // Los favoritos siguen en memoria durante la sesión.
    }
  }, [favoriteIds]);

  const isFavorite = useCallback(
    (productId: number) => favoriteIds.includes(productId),
    [favoriteIds]
  );

  // Devuelve true si el producto quedó marcado como favorito.
  const toggleFavorite = useCallback(
    (productId: number) => {
      const adding = !favoriteIds.includes(productId);
      setFavoriteIds((current) =>
        adding ? [...current, productId] : current.filter((id) => id !== productId)
      );
      return adding;
    },
    [favoriteIds]
  );

  const value = useMemo(
    () => ({ favoriteIds, isFavorite, toggleFavorite }),
    [favoriteIds, isFavorite, toggleFavorite]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites debe utilizarse dentro de FavoritesProvider");
  }

  return context;
}
