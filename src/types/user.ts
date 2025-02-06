
export interface loginDataType {
    grant_type?:string
    password?: string;
    username: string;
}
export interface registerDataType {
    password: string;
    username: string;
    role: string
}
export interface userInfoType{
    id: number,
    username:string,
    role:string 
}