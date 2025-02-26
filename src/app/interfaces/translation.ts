
export interface Translation {
    id:string,
    word:string,
    audio?:string,
    translations: {
        [key: string]: {
            words: string[];
            audio?: string;
        };
    };
}