// src/hooks/useDebouncedValue.ts
import { useEffect, useState } from 'react';

/** Retorna `value` só depois de `delay` ms sem mudanças (evita uma requisição por tecla). */
export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
