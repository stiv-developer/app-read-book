import { ContentBook } from "./contentBook";

export interface Book {
    id: string;
    title: string;
    author: string;
    img: string;
    imageId?: string; // ID de la imagen en la base de datos
    star: number;
    status: 'completed' | 'process' | 'process';
    category: string;
    contents: ContentBook[];
}