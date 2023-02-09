export interface Regalo {
    nombre?: string,
    precio?: number,
    estado?: "PAGADO" | "LIBRE"
    imagenUrl?: ImageInfo[],
    imagenThumbUrl?: string,
    pruebadePagoUrl?: string
}

export interface ImageInfo {
    name: string,
    url: string,
  }