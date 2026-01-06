/**
 * Utilitaires de memoization pour optimiser les performances React
 */

import { useMemo, useCallback, DependencyList } from 'react';

/**
 * Compare deux objets superficiellement pour déterminer si un re-render est nécessaire
 * Utilisé avec React.memo pour éviter les re-renders inutiles
 */
export function shallowEqual<T extends Record<string, unknown>>(objA: T, objB: T): boolean {
  if (objA === objB) return true;
  if (!objA || !objB) return false;

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (objA[key] !== objB[key]) return false;
  }

  return true;
}

/**
 * Compare deux arrays superficiellement
 */
export function arraysEqual<T>(arrA: T[], arrB: T[]): boolean {
  if (arrA === arrB) return true;
  if (!arrA || !arrB) return false;
  if (arrA.length !== arrB.length) return false;

  for (let i = 0; i < arrA.length; i++) {
    if (arrA[i] !== arrB[i]) return false;
  }

  return true;
}

/**
 * Crée une fonction de comparaison personnalisée pour React.memo
 * basée sur des propriétés spécifiques
 */
export function createPropsComparator<P extends Record<string, unknown>>(
  propsToCompare: (keyof P)[]
): (prevProps: P, nextProps: P) => boolean {
  return (prevProps: P, nextProps: P): boolean => {
    for (const prop of propsToCompare) {
      if (prevProps[prop] !== nextProps[prop]) {
        return false;
      }
    }
    return true;
  };
}

/**
 * Hook personnalisé pour memoizer des calculs coûteux sur les listes
 * Utile pour filtrer/trier de grandes listes de données
 */
export function useMemoizedFilter<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  deps: DependencyList
): T[] {
  return useMemo(() => items.filter(filterFn), [items, ...deps]);
}

/**
 * Hook personnalisé pour memoizer le tri de listes
 */
export function useMemoizedSort<T>(
  items: T[],
  compareFn: (a: T, b: T) => number,
  deps: DependencyList
): T[] {
  return useMemo(() => [...items].sort(compareFn), [items, ...deps]);
}

/**
 * Hook pour créer un debounced callback
 * Utile pour les recherches avec délai
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = { current: null as NodeJS.Timeout | null };

  return useCallback(
    ((...args: unknown[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

/**
 * Hook pour créer un throttled callback
 * Utile pour les événements fréquents comme scroll/resize
 */
export function useThrottledCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const lastRunRef = { current: 0 };

  return useCallback(
    ((...args: unknown[]) => {
      const now = Date.now();
      if (now - lastRunRef.current >= delay) {
        lastRunRef.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Memoize une fonction de formatage (ex: formatage de dates, montants)
 * Utilise un cache simple pour éviter de recalculer les mêmes valeurs
 */
export function createMemoizedFormatter<T, R>(
  formatter: (value: T) => R,
  maxCacheSize: number = 100
): (value: T) => R {
  const cache = new Map<T, R>();

  return (value: T): R => {
    if (cache.has(value)) {
      return cache.get(value)!;
    }

    const result = formatter(value);

    // Limiter la taille du cache
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    cache.set(value, result);
    return result;
  };
}

// Formateurs memoizés pré-configurés pour l'application
export const memoizedFormatters = {
  // Formater un montant en euros
  formatEuros: createMemoizedFormatter((amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
  ),

  // Formater une date en format français
  formatDate: createMemoizedFormatter((dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('fr-FR').format(date);
    } catch {
      return dateStr;
    }
  }),

  // Formater un pourcentage
  formatPercent: createMemoizedFormatter((value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 1 }).format(value / 100)
  ),
};
