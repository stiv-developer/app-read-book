import { ContentChapter } from "./contentChapter";

export interface ContentBook {
    id: string;
    chapterName: string;
    position: number;
    chapters: ContentChapter[];
}