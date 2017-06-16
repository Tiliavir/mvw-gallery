import * as fs from "fs";
import * as gulp from "gulp";
import * as gulpLoadPlugins from "gulp-load-plugins";
import * as sizeOf from "image-size";
import * as through from "through2";
import * as os from "os";
import * as File from "vinyl";
import { ImageProcessor } from "./ImageProcessor";
import * as program from "commander";

let parallel = require("concurrent-transform");
let lazypipe = require("lazypipe");
var logger = require('gulplog');

let img: ImageProcessor;
let $: any = gulpLoadPlugins();

let processImage = (w: number, h: number, p: string, output: string) => {
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
    .pipe(gulp.dest, output)
    .pipe(through.obj, (file: File, enc: string, cb: Function): void => {
      img.addSize(file, sizeOf(file.path));
      cb(null, file);
    });
};

let resize = (input: string, output: string) => {
  img = new ImageProcessor();
  let images = null;
  let state = null;
  try {
    images = require(input + "galleries.json");
    state = require(input + "state.json");
  } catch (e) {
  }

  if (!img.init(images, state)) {
    logger.info("Could not restore gallery information - will start from scratch!");
  }

  return gulp.src(input + "**/*.{png,jpg,jpeg,PNG,JPG,JPEG}", { base: input })
            .pipe(through.obj((chunk: File, enc: string, cb: Function): void => {
              img.addInformation(chunk);
              cb(null, chunk);
            }))
            .pipe($.rename((path: File) => {
              path.basename = img.filename.replace(/(\..{3,4})$/, "");
              let info = path.dirname.split("\\");
              path.dirname = path.dirname.replace(info[info.length - 1], img.foldername);
            }))
            .pipe(processImage(1200, 1200, null, output)())
            .pipe(processImage(800, 800, "m", output)())
            .pipe(processImage(200, 200, "s", output)());
}

let writeFile = (output: string) => {
  img.writeFiles(fs.writeFileSync, output);
}

program.version('1.0.4')
       .arguments("<input> <output>")
       .action((input, output) => {
         if(!output || !input) {
           program.help();
         }

         logger.on("debug", (d: string) => process.stdout.write(d + "\n"));
         logger.on("info", (i: string) => process.stdout.write(i + "\n"));
         logger.on("warn", (w: string) => process.stdout.write(w + "\n"));
         logger.on("error", (e: string) => process.stderr.write(e + "\n"));

         resize(input, output).on("end", () => writeFile(output));
       })
       .parse(process.argv);
