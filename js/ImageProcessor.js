"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var EXTENSION_REGEX = /(\..{3,4})$/;
var ImageProcessor = (function () {
    function ImageProcessor() {
        this.foldername = "";
        this.filename = "";
        this.images = {};
        this.restored = false;
        this.galleryTitles = {};
        this.galleryCount = {};
    }
    ImageProcessor.prototype.addInformation = function (file) {
        var info = this.getInfoFromFile(file);
        var year = this.images[info.year] || (this.images[info.year] = {});
        var gallery = year[info.gallery];
        if (!gallery) {
            gallery = (year[info.gallery] = []);
            this.galleryCount[info.year] = (this.galleryCount[info.year] || 0) + 1;
        }
        var filecount = Object.keys(gallery || []).length;
        this.filename = util_1.padLeft(filecount + "", 5, "0") + info.extension.toLowerCase();
        this.foldername = util_1.padLeft(this.galleryCount[info.year] + "", 3, "0");
        this.galleryTitles[info.year + "_" + this.foldername] = info.gallery;
        gallery.push({
            b: info.year + "/" + this.foldername + "/",
            f: this.filename,
            m: { w: 0, h: 0 },
            o: { w: 0, h: 0 },
            s: { w: 0, h: 0 },
            t: info.title
        });
    };
    ImageProcessor.prototype.addSize = function (file, size) {
        var info = this.getInfoFromFile(file);
        var galleryTitle = this.galleryTitles[info.year + "_" + info.gallery];
        var e = this.images[info.year][galleryTitle].filter(function (o) {
            return o.f.toUpperCase() === info.filename.toUpperCase();
        })[0][info.prefix || "o"];
        e.w = size.width;
        e.h = size.height;
    };
    ImageProcessor.prototype.init = function (oldGalleries, state) {
        if (!oldGalleries || !state) {
            return false;
        }
        this.images = oldGalleries;
        this.restored = true;
        this.galleryTitles = state.titles;
        this.galleryCount = state.count;
        return true;
    };
    ImageProcessor.prototype.writeFiles = function (writer, path) {
        writer(path + (this.restored ? "new_" : "") + "galleries.json", JSON.stringify(this.images));
        var state = {
            count: this.galleryCount,
            titles: this.galleryTitles
        };
        writer(path + "state.json", JSON.stringify(state));
    };
    ImageProcessor.prototype.getInfoFromFile = function (file) {
        var info = file.relative.split("\\");
        var p = "";
        if (info.length === 4) {
            p = info[2];
        }
        var fn = info[info.length - 1];
        return {
            extension: EXTENSION_REGEX.exec(fn)[1],
            filename: fn,
            gallery: info[1],
            prefix: p,
            title: fn.replace(EXTENSION_REGEX, ""),
            year: info[0]
        };
    };
    return ImageProcessor;
}());
exports.ImageProcessor = ImageProcessor;
//# sourceMappingURL=ImageProcessor.js.map