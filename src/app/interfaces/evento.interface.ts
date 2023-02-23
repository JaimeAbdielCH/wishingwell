import { Regalo, ImageInfo } from "./regalo.interface"
export interface Evento {
    id: string,
    private?: boolean,
    ownerId: string,
    tituloDescripcion?: string,
    tipoEvento?: "Boda" | "Bautizo" | "Baby Shower" | "Cumpleaños",
    descripcion: string,
    imagenPortada?: string,
    imagenesEventos?: ImageInfo[],
    imagenHeader?: string,
    nombre?: string,
    fecha?: string,
    hora?: string,
    invitados?: Invitado[],
    regalos?: Regalo[],
    latlng?: string, //{ center: {lat: 30, lng: -110}, zoom: 8, mapId: '1234' } as google.maps.MapOptions
    informacionDePago?: string,
    fontFamily?: string,
    fontColor?: string,
    defaultImage?: boolean,
    mensajeInvitacion?: string
}

export interface Invitado {
    email?: string,
    notificado?: boolean,
    respuesta?: "Si" | "No"
}