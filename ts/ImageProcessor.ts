import { padLeft } from "./util";
import * as File from "vinyl";

export type Titles = { [year_folder: string]: string };
export type Count = { [year: string]: number };
export type GalleryList = { [gallery: string]: IImage[] };
export type GalleriesPerYear = { [year: string]: GalleryList };

export interface IImageSize {
  w: number;
  h: number;
}

export interface IImage {
  t: string; // title
  f: string; // filename
  b: string, // base (year/foldername/)
  o: IImageSize, // original
  m: IImageSize, // middle
  s: IImageSize // small
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
  titles: Titles;
  count: Count;
}

const EXTENSION_REGEX: RegExp = /(\..{3,4})$/;

export class ImageProcessor {
  private images: GalleriesPerYear = {};
  private restored = false;
  private galleryTitles: Titles = {};
  private galleryCount: Count = {};

  public foldername: string = "";
  public filename: string = "";

  private getInfoFromFile(file: File): IFileInfo {
    let info: string[] = file.relative.split("\\");

    let p: string = "";
    if (info.length === 4) {
      p = info[2];
    }

    let fn: string = info[info.length - 1];
    return {
      year: info[0],
      gallery: info[1],
      prefix: p,
      filename: fn,
      title: fn.replace(EXTENSION_REGEX, ""),
      extension: EXTENSION_REGEX.exec(fn)[1]
    }
  }

  public init(oldGalleries: GalleriesPerYear, state: IState): boolean {
    if (!oldGalleries || !state) {
      return false;
    }

    this.images = oldGalleries;
    this.restored = true;
    this.galleryTitles = state.titles;
    this.galleryCount = state.count;
    return true;
  }

  public addInformation(file: File): void {
    let info: IFileInfo = this.getInfoFromFile(file);

    let year: GalleryList = this.images[info.year] || (this.images[info.year] = {});
    let gallery: IImage[] = year[info.gallery];
    if (!gallery) {
      gallery = (year[info.gallery] = []);
      this.galleryCount[info.year] = (this.galleryCount[info.year] || 0) + 1;
    }

    let filecount: number = Object.keys(gallery || []).length;
    this.filename = padLeft(filecount + "", 5, "0") + info.extension.toLowerCase();
    this.foldername = padLeft(this.galleryCount[info.year] + "", 3, "0");

    this.galleryTitles[info.year + "_" + this.foldername] = info.gallery;

    gallery.push({
      t: info.title,
      f: this.filename,
      b: info.year + "/" + this.foldername + "/",
      o: { w: 0, h: 0 },
      m: { w: 0, h: 0 },
      s: { w: 0, h: 0 }
    });
  }

  public addSize(file: File, size: ISize) {
    let info: IFileInfo = this.getInfoFromFile(file);
    let galleryTitle: string = this.galleryTitles[info.year + "_" + info.gallery];
    let e: IImageSize = this.images[info.year][galleryTitle].filter((o: IImage) => {
      return o.f.toUpperCase() === info.filename.toUpperCase();
    })[0][info.prefix || "o"];

    e.w = size.width;
    e.h = size.height;
  }

  public writeFiles(writer: (location: string, content: string) => any, path: string) {
    writer(path + (this.restored ? "new_" : "") + "galleries.json", JSON.stringify(this.images));
    let state: IState = {
      titles: this.galleryTitles,
      count: this.galleryCount
    };
    writer(path + "state.json", JSON.stringify(state));
  }
}
