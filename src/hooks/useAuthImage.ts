// src/hooks/useAuthImage.ts
import { useEffect, useState } from 'react';
import api from '../services/api';
import { fileUrl } from '../config';

/**
 * Os arquivos em /uploads exigem login, e <img src> não envia o header Authorization.
 * Este hook baixa a imagem pelo axios (que injeta o token) e devolve uma URL local (blob:).
 */
export function useAuthImage(path?: string | null) {
  const [src, setSrc] = useState<string>();
  const [erro, setErro] = useState(false);

  useEffect(() => {
    setSrc(undefined);
    setErro(false);
    const url = fileUrl(path);
    if (!url) return;

    let objectUrl: string | undefined;
    let cancelado = false;
    api
      .get(url, { responseType: 'blob' })
      .then((res) => {
        if (cancelado) return;
        objectUrl = URL.createObjectURL(res.data);
        setSrc(objectUrl);
      })
      .catch(() => !cancelado && setErro(true));

    return () => {
      cancelado = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  return { src, erro };
}
