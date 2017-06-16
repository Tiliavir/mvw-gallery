"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var gulp = require("gulp");
var gulpLoadPlugins = require("gulp-load-plugins");
var sizeOf = require("image-size");
var through = require("through2");
var os = require("os");
var ImageProcessor_1 = require("./ImageProcessor");
var program = require("commander");
var parallel = require("concurrent-transform");
var lazypipe = require("lazypipe");
var logger = require('gulplog');
var img;
var $ = gulpLoadPlugins();
var processImage = function (w, h, p, output) {
    return lazypipe()
        .pipe($.rename, function (path) {
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
        .pipe(through.obj, function (file, enc, cb) {
        img.addSize(file, sizeOf(file.path));
        cb(null, file);
    });
};
var resize = function (input, output) {
    logger.info("hoi");
    img = new ImageProcessor_1.ImageProcessor();
    var images = null;
    var state = null;
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
        .pipe(through.obj(function (chunk, enc, cb) {
        img.addInformation(chunk);
        cb(null, chunk);
    }))
        .pipe($.rename(function (path) {
        path.basename = img.filename.replace(/(\..{3,4})$/, "");
        var info = path.dirname.split("\\");
        path.dirname = path.dirname.replace(info[info.length - 1], img.foldername);
    }))
        .pipe(processImage(1200, 1200, null, output)())
        .pipe(processImage(800, 800, "m", output)())
        .pipe(processImage(200, 200, "s", output)());
};
var writeFile = function (output) {
    img.writeFiles(fs.writeFileSync, output);
};
program.version('1.0.4')
    .arguments("<input> <output>")
    .action(function (input, output) {
    if (!output || !input) {
        program.help();
    }
    logger.on("debug", function (d) { return process.stdout.write(d + "\n"); });
    logger.on("info", function (i) { return process.stdout.write(i + "\n"); });
    logger.on("warn", function (w) { return process.stdout.write(w + "\n"); });
    logger.on("error", function (e) { return process.stderr.write(e + "\n"); });
    resize(input, output).on("end", function () { return writeFile(output); });
})
    .parse(process.argv);
//# sourceMappingURL=gulpfile.js.map