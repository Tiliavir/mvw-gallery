"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const EXTENSION_REGEX = /(\..{3,4})$/;
class ImageProcessor {
    constructor() {
        this.images = {};
        this.restored = false;
        this.galleryTitles = {};
        this.galleryCount = {};
        this.foldername = "";
        this.filename = "";
    }
    getInfoFromFile(file) {
        let info = file.relative.split("\\");
        let p = "";
        if (info.length === 4) {
            p = info[2];
        }
        let fn = info[info.length - 1];
        return {
            year: info[0],
            gallery: info[1],
            prefix: p,
            filename: fn,
            title: fn.replace(EXTENSION_REGEX, ""),
            extension: EXTENSION_REGEX.exec(fn)[1]
        };
    }
    init(oldGalleries, state) {
        if (!oldGalleries || !state) {
            return false;
        }
        this.images = oldGalleries;
        this.restored = true;
        this.galleryTitles = state.titles;
        this.galleryCount = state.count;
        return true;
    }
    addInformation(file) {
        let info = this.getInfoFromFile(file);
        let year = this.images[info.year] || (this.images[info.year] = {});
        let gallery = year[info.gallery];
        if (!gallery) {
            gallery = (year[info.gallery] = []);
            this.galleryCount[info.year] = (this.galleryCount[info.year] || 0) + 1;
        }
        let filecount = Object.keys(gallery || []).length;
        this.filename = util_1.padLeft(filecount + "", 5, "0") + info.extension.toLowerCase();
        this.foldername = util_1.padLeft(this.galleryCount[info.year] + "", 3, "0");
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
    addSize(file, size) {
        let info = this.getInfoFromFile(file);
        let galleryTitle = this.galleryTitles[info.year + "_" + info.gallery];
        let e = this.images[info.year][galleryTitle].filter((o) => {
            return o.f.toUpperCase() === info.filename.toUpperCase();
        })[0][info.prefix || "o"];
        e.w = size.width;
        e.h = size.height;
    }
    writeFiles(writer, path) {
        writer(path + (this.restored ? "new_" : "") + "galleries.json", JSON.stringify(this.images));
        let state = {
            titles: this.galleryTitles,
            count: this.galleryCount
        };
        writer(path + "state.json", JSON.stringify(state));
    }
}
exports.ImageProcessor = ImageProcessor;
//# sourceMappingURL=ImageProcessor.js.map