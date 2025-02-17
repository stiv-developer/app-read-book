import { ContentBook } from "./contentBook";

export interface Book {
    id: string;
    title: string;
    author: string;
    img: string;
    star: number;
    contents: ContentBook[];
}