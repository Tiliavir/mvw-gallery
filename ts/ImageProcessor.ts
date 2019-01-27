import * as File from "vinyl";
import { padLeft } from "./util";

export interface ITitles { [yearFolder: string]: string; }
export interface ICount { [year: string]: number; }
export interface IGalleryList { [gallery: string]: IImage[]; }
export interface IGalleriesPerYear { [year: string]: IGalleryList; }

export interface IImageSize {
  w: number;
  h: number;
}

export interface IImage {
  t: string; // title
  f: string; // filename
  b: string; // base (year/foldername/)
  o: IImageSize; // original
  m: IImageSize; // middle
  s: IImageSize; // small
}

interface IFileInfo {
  year: string;
  gallery: string;
  prefix: string;
  filename: string;
  title: string;
  extension: string;
}

export interface ISize {
  width: number;
  height: number;
}

export interface IState {
  titles: ITitles;
  count: ICount;
}

const EXTENSION_REGEX: RegExp = /(\..{3,4})$/;

export class ImageProcessor {
  public foldername: string = "";
  public filename: string = "";

  private images: IGalleriesPerYear = {};
  private restored = false;
  private galleryTitles: ITitles = {};
  private galleryCount: ICount = {};

  public addInformation(file: File): void {
    const info: IFileInfo = this.getInfoFromFile(file);

    const year: IGalleryList = this.images[info.year] || (this.images[info.year] = {});
    let gallery: IImage[] = year[info.gallery];
    if (!gallery) {
      gallery = (year[info.gallery] = []);
      this.galleryCount[info.year] = (this.galleryCount[info.year] || 0) + 1;
    }

    const filecount: number = Object.keys(gallery || []).length;
    this.filename = padLeft(filecount + "", 5, "0") + info.extension.toLowerCase();
    this.foldername = padLeft(this.galleryCount[info.year] + "", 3, "0");

    this.galleryTitles[info.year + "_" + this.foldername] = info.gallery;

    gallery.push({
      b: info.year + "/" + this.foldername + "/",
      f: this.filename,
      m: { w: 0, h: 0 },
      o: { w: 0, h: 0 },
      s: { w: 0, h: 0 },
      t: info.title,
    });
  }

  public addSize(file: File, size: ISize) {
    const info: IFileInfo = this.getInfoFromFile(file);
    const galleryTitle: string = this.galleryTitles[info.year + "_" + info.gallery];
    const e: IImageSize = this.images[info.year][galleryTitle].filter((o: IImage) => {
      return o.f.toUpperCase() === info.filename.toUpperCase();
    })[0][info.prefix || "o"];

    e.w = size.width;
    e.h = size.height;
  }

  public init(oldGalleries: IGalleriesPerYear, state: IState): boolean {
    if (!oldGalleries || !state) {
      return false;
    }

    this.images = oldGalleries;
    this.restored = true;
    this.galleryTitles = state.titles;
    this.galleryCount = state.count;
    return true;
  }

  public writeFiles(writer: (location: string, content: string) => any, path: string) {
    writer(path + (this.restored ? "new_" : "") + "galleries.json", JSON.stringify(this.images));
    const state: IState = {
      count: this.galleryCount,
      titles: this.galleryTitles,
    };
    writer(path + "state.json", JSON.stringify(state));
  }

  private getInfoFromFile(file: File): IFileInfo {
    const info: string[] = file.relative.split("\\");

    let p: string = "";
    if (info.length === 4) {
      p = info[2];
    }

    const fn: string = info[info.length - 1];
    return {
      extension: EXTENSION_REGEX.exec(fn)[1],
      filename: fn,
      gallery: info[1],
      prefix: p,
      title: fn.replace(EXTENSION_REGEX, ""),
      year: info[0],
    };
  }
}
