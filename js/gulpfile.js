"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var gulp = require("gulp");
var gulpLoadPlugins = require("gulp-load-plugins");
var sizeOf = require("image-size");
var through = require("through2");
var os = require("os");
var ImageProcessor_1 = require("./ImageProcessor");
var commander_1 = require("@types/commander");
var parallel = require("concurrent-transform");
var lazypipe = require("lazypipe");
var logger = require('gulplog');
var program = new commander_1.Command()
    .version('1.0.3')
    .usage('-i ../inputpath -o ./outpath')
    .option('-i, --input <input>', 'input path')
    .option('-o, --output <output>', 'output path')
    .allowUnknownOption()
    .parse(process.argv);
if (!program["output"] || !program["input"]) {
    program.help();
}
else {
    var img_1 = new ImageProcessor_1.ImageProcessor();
    var $_1 = gulpLoadPlugins();
    gulp.task("resize", function () {
        var processImage = function (w, h, p) {
            return lazypipe()
                .pipe($_1.rename, function (path) {
                if (/\\m$/.test(path.dirname) || /\\s$/.test(path.dirname)) {
                    path.dirname = path.dirname.substring(0, path.dirname.length - 2);
                }
                path.dirname += (p ? ("/" + p) : "");
            })
                .pipe(parallel, $_1.imageResize({
                width: w,
                height: h,
                noProfile: true,
                crop: false,
                upscale: false,
                format: "jpg",
                quality: 0.7
            }), os.cpus().length)
                .pipe(gulp.dest, program["output"])
                .pipe(through.obj, function (file, enc, cb) {
                img_1.addSize(file, sizeOf(file.path));
                cb(null, file);
            });
        };
        var images = null;
        var state = null;
        try {
            images = require(program["input"] + "galleries.json");
            state = require(program["input"] + "state.json");
        }
        catch (e) {
        }
        if (!img_1.init(images, state)) {
            logger.info("Could not restore gallery information - will start from scratch!");
        }
        return gulp.src(program["input"] + "**/*.{png,jpg,jpeg,PNG,JPG,JPEG}", { base: program["input"] })
            .pipe(through.obj(function (chunk, enc, cb) {
            img_1.addInformation(chunk);
            cb(null, chunk);
        }))
            .pipe($_1.rename(function (path) {
            path.basename = img_1.filename.replace(/(\..{3,4})$/, "");
            var info = path.dirname.split("\\");
            path.dirname = path.dirname.replace(info[info.length - 1], img_1.foldername);
        }))
            .pipe(processImage(1200, 1200, null)())
            .pipe(processImage(800, 800, "m")())
            .pipe(processImage(200, 200, "s")());
    });
    gulp.task("write-file", function () {
        img_1.writeFiles(fs.writeFileSync, program["output"]);
    });
    gulp.task("default", gulp.series("resize", "write-file"));
}
//# sourceMappingURL=gulpfile.js.map