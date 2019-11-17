"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var fs = require("fs");
var gulp = require("gulp");
var gulpLoadPlugins = require("gulp-load-plugins");
var image_size_1 = require("image-size");
var lazypipe = require("lazypipe");
var os = require("os");
var path = require("path");
var through = require("through2");
var ImageProcessor_1 = require("./ImageProcessor");
var parallel = require("concurrent-transform");
var logger = require("gulplog");
var $ = gulpLoadPlugins();
var img;
var processImage = function (w, h, p, output) {
    return lazypipe()
        .pipe($.rename, function (filepath) {
        if (/\\m$/.test(filepath.dirname) || /\\s$/.test(filepath.dirname)) {
            filepath.dirname = filepath.dirname.substring(0, filepath.dirname.length - 2);
        }
        filepath.dirname += (p ? ("/" + p) : "");
    })
        .pipe(parallel, $.imageResize({
        crop: false,
        format: "jpg",
        height: h,
        noProfile: true,
        quality: 0.7,
        upscale: false,
        width: w,
    }), os.cpus().length)
        .pipe(gulp.dest, output)
        .pipe(through.obj, function (file, enc, cb) {
        img.addSize(file, image_size_1.imageSize(file.path));
        cb(null, file);
    });
};
var resize = function (input, output) {
    img = new ImageProcessor_1.ImageProcessor();
    var images = null;
    var state = null;
    try {
        images = require(path.join(input, "galleries.json"));
        state = require(path.join(input, "state.json"));
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
        .pipe($.rename(function (filepath) {
        filepath.basename = img.filename.replace(/(\..{3,4})$/, "");
        var info = filepath.dirname.split("\\");
        filepath.dirname = filepath.dirname.replace(info[info.length - 1], img.foldername);
    }))
        .pipe(processImage(1200, 1200, null, output)())
        .pipe(processImage(800, 800, "m", output)())
        .pipe(processImage(200, 200, "s", output)());
};
var writeFile = function (output) {
    img.writeFiles(fs.writeFileSync, output);
};
program.version("1.0.4")
    .arguments("<input> <output>")
    .action(function (input, output) {
    if (!output || !input) {
        program.help();
    }
    input = path.join(process.cwd(), input);
    output = path.join(process.cwd(), output);
    logger.on("debug", function (d) { return process.stdout.write(d + "\n"); });
    logger.on("info", function (i) { return process.stdout.write(i + "\n"); });
    logger.on("warn", function (w) { return process.stdout.write(w + "\n"); });
    logger.on("error", function (e) { return process.stderr.write(e + "\n"); });
    resize(input, output).on("end", function () { return writeFile(output); });
})
    .parse(process.argv);
//# sourceMappingURL=gulpfile.js.map