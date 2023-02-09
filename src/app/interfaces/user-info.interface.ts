import { Roles } from "./role.interface"
export interface UserInfo {
    ownerId: string,
    role: Roles,
    photo: string,
    displayName: string
}