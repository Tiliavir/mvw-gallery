/// <reference types="vinyl" />
import * as File from "vinyl";
export declare type Titles = {
    [year_folder: string]: string;
};
export declare type Count = {
    [year: string]: number;
};
export declare type GalleryList = {
    [gallery: string]: IImage[];
};
export declare type GalleriesPerYear = {
    [year: string]: GalleryList;
};
export interface IImageSize {
    w: number;
    h: number;
}
export interface IImage {
    t: string;
    f: string;
    b: string;
    o: IImageSize;
    m: IImageSize;
    s: IImageSize;
}
export interface ISize {
    width: number;
    height: number;
}
export interface IState {
    titles: Titles;
    count: Count;
}
export declare class ImageProcessor {
    private images;
    private restored;
    private galleryTitles;
    private galleryCount;
    foldername: string;
    filename: string;
    private getInfoFromFile(file);
    init(oldGalleries: GalleriesPerYear, state: IState): boolean;
    addInformation(file: File): void;
    addSize(file: File, size: ISize): void;
    writeFiles(writer: (location: string, content: string) => any, path: string): void;
}
