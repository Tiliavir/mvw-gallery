import * as fs from "fs";
import * as gulp from "gulp";
import * as gulpLoadPlugins from "gulp-load-plugins";
import * as sizeOf from "image-size";
import * as through from "through2";
import * as os from "os";
import * as File from "vinyl";
import { ImageProcessor } from "./ImageProcessor";
import { Command, CommanderStatic } from "@types/commander";

let parallel = require("concurrent-transform");
let lazypipe = require("lazypipe");
var logger = require('gulplog');

let program = new Command()
       .version('1.0.3')
       .usage('-i ../inputpath -o ./outpath')
       .option('-i, --input <input>', 'input path')
       .option('-o, --output <output>', 'output path')
       .allowUnknownOption()
       .parse(process.argv);

if(!program["output"] || !program["input"]) {
    program.help();
} else {
  let img: ImageProcessor = new ImageProcessor();
  let $: any = gulpLoadPlugins();

  gulp.task("resize", () => {
    let processImage = (w: number, h: number, p: string) => {
      return lazypipe()
        .pipe($.rename, (path: File): void => {
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
          }),
          os.cpus().length)
        .pipe(gulp.dest, program["output"])
        .pipe(through.obj, (file: File, enc: string, cb: Function): void => {
          img.addSize(file, sizeOf(file.path));
          cb(null, file);
        });
    };

    let images = null;
    let state = null;
    try {
      images = require(program["input"] + "galleries.json");
      state = require(program["input"] + "state.json");
    } catch (e) {
    }

    if (!img.init(images, state)) {
      logger.info("Could not restore gallery information - will start from scratch!");
    }

    return gulp.src(program["input"] + "**/*.{png,jpg,jpeg,PNG,JPG,JPEG}", { base: program["input"] })
              .pipe(through.obj((chunk: File, enc: string, cb: Function): void => {
                img.addInformation(chunk);
                cb(null, chunk);
              }))
              .pipe($.rename((path: File) => {
                path.basename = img.filename.replace(/(\..{3,4})$/, "");
                let info = path.dirname.split("\\");
                path.dirname = path.dirname.replace(info[info.length - 1], img.foldername);
              }))
              .pipe(processImage(1200, 1200, null)())
              .pipe(processImage(800, 800, "m")())
              .pipe(processImage(200, 200, "s")());
  });

  gulp.task("write-file", (): void => {
    img.writeFiles(fs.writeFileSync, program["output"]);
  });

  gulp.task("default", gulp.series("resize", "write-file"));
}
