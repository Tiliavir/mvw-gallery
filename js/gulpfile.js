"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const gulp = require("gulp");
const gulpLoadPlugins = require("gulp-load-plugins");
const sizeOf = require("image-size");
const through = require("through2");
const os = require("os");
const ImageProcessor_1 = require("./ImageProcessor");
const program = require("commander");
let parallel = require("concurrent-transform");
let lazypipe = require("lazypipe");
var logger = require('gulplog');
let img;
let $ = gulpLoadPlugins();
let processImage = (w, h, p, output) => {
    return lazypipe()
        .pipe($.rename, (path) => {
        if (/\\m$/.test(path.dirname) || /\\s$/.test(path.dirname)) {
            path.dirname = path.dirname.substring(0, path.dirname.length - 2);
        }
        path.dirname += (p ? ("/" + p) : "");
    })
        .pipe(parallel, $.imageResize({
        width: w,
        height: h,
        noProfile: true,
        crop: false,
        upscale: false,
        format: "jpg",
        quality: 0.7
    }), os.cpus().length)
        .pipe(gulp.dest, output)
        .pipe(through.obj, (file, enc, cb) => {
        img.addSize(file, sizeOf(file.path));
        cb(null, file);
    });
};
let resize = (input, output) => {
    img = new ImageProcessor_1.ImageProcessor();
    let images = null;
    let state = null;
    try {
        images = require(input + "galleries.json");
        state = require(input + "state.json");
    }
    catch (e) {
    }
    if (!img.init(images, state)) {
        logger.info("Could not restore gallery information - will start from scratch!");
    }
    return gulp.src(input + "**/*.{png,jpg,jpeg,PNG,JPG,JPEG}", { base: input })
        .pipe(through.obj((chunk, enc, cb) => {
        img.addInformation(chunk);
        cb(null, chunk);
    }))
        .pipe($.rename((path) => {
        path.basename = img.filename.replace(/(\..{3,4})$/, "");
        let info = path.dirname.split("\\");
        path.dirname = path.dirname.replace(info[info.length - 1], img.foldername);
    }))
        .pipe(processImage(1200, 1200, null, output)())
        .pipe(processImage(800, 800, "m", output)())
        .pipe(processImage(200, 200, "s", output)());
};
let writeFile = (output) => {
    img.writeFiles(fs.writeFileSync, output);
};
program.version('1.0.4')
    .arguments("<input> <output>")
    .action((input, output) => {
    if (!output || !input) {
        program.help();
    }
    logger.on("debug", (d) => process.stdout.write(d + "\n"));
    logger.on("info", (i) => process.stdout.write(i + "\n"));
    logger.on("warn", (w) => process.stdout.write(w + "\n"));
    logger.on("error", (e) => process.stderr.write(e + "\n"));
    resize(input, output).on("end", () => writeFile(output));
})
    .parse(process.argv);
//# sourceMappingURL=gulpfile.js.map