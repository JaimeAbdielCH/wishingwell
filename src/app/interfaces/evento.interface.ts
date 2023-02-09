import { Regalo, ImageInfo } from "./regalo.interface"
export interface Evento {
    id: string,
    ownerId: string,
    tituloDescripcion?: string,
    descripcion: string,
    imagenPortada?: string,
    imagenesEventos?: ImageInfo[],
    imagenHeader?: string,
    nombre?: string,
    fecha?: string,
    hora?: string,
    invitados?: string[],
    regalos?: Regalo[],
    latlng?: string, //{ center: {lat: 30, lng: -110}, zoom: 8, mapId: '1234' } as google.maps.MapOptions
    informacionDePago?: string
}