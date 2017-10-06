/// <reference types="vinyl" />
import * as File from "vinyl";
export interface ITitles {
    [yearFolder: string]: string;
}
export interface ICount {
    [year: string]: number;
}
export interface IGalleryList {
    [gallery: string]: IImage[];
}
export interface IGalleriesPerYear {
    [year: string]: IGalleryList;
}
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
    titles: ITitles;
    count: ICount;
}
export declare class ImageProcessor {
    foldername: string;
    filename: string;
    private images;
    private restored;
    private galleryTitles;
    private galleryCount;
    addInformation(file: File): void;
    addSize(file: File, size: ISize): void;
    init(oldGalleries: IGalleriesPerYear, state: IState): boolean;
    writeFiles(writer: (location: string, content: string) => any, path: string): void;
    private getInfoFromFile(file);
}
