import * as program from "commander";
import * as fs from "fs";
import * as gulp from "gulp";
import { TaskFunction } from "gulp";
import * as gulpLoadPlugins from "gulp-load-plugins";
import * as sizeOf from "image-size";
import * as os from "os";
import * as path from "path";
import * as through from "through2";
import * as File from "vinyl";
import { ImageProcessor } from "./ImageProcessor";

import lazypipe = require("lazypipe"); // refactor when version > 0.0.30

// tslint:disable-next-line:no-var-requires
const parallel = require("concurrent-transform");
// tslint:disable-next-line:no-var-requires
const logger = require("gulplog");

const $: any = gulpLoadPlugins();

let img: ImageProcessor;

const processImage = (w: number, h: number, p: string, output: string) => {
  return lazypipe()
    .pipe($.rename, (filepath: File): void => {
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
        width: w
      }),
      os.cpus().length)
    .pipe(gulp.dest, output)
    .pipe(through.obj, (file: File, enc: string, cb: (err: any, data: any) => void): void => {
      img.addSize(file, sizeOf(file.path));
      cb(null, file);
    });
};

const resize = (input: string, output: string) => {
  img = new ImageProcessor();
  let images = null;
  let state = null;
  try {
    images = require(path.join(input, "galleries.json"));
    state = require(path.join(input, "state.json"));
  } catch (e) {
    // ignore
  }

  if (!img.init(images, state)) {
    logger.info("Could not restore gallery information - will start from scratch!");
  }

  return gulp.src(input + "**/*.{png,jpg,jpeg,PNG,JPG,JPEG}", { base: input })
            .pipe(through.obj((chunk: File, enc: string, cb: (err: any, data: any) => void): void => {
              img.addInformation(chunk);
              cb(null, chunk);
            }))
            .pipe($.rename((filepath: File) => {
              filepath.basename = img.filename.replace(/(\..{3,4})$/, "");
              const info: string[] = filepath.dirname.split("\\");
              filepath.dirname = filepath.dirname.replace(info[info.length - 1], img.foldername);
            }))
            .pipe(processImage(1200, 1200, null, output)())
            .pipe(processImage(800, 800, "m", output)())
            .pipe(processImage(200, 200, "s", output)());
};

const writeFile = (output: string) => {
  img.writeFiles(fs.writeFileSync, output);
};

program.version("1.0.4")
       .arguments("<input> <output>")
       .action((input, output) => {
         if (!output || !input) {
           program.help();
         }

         input = path.join(process.cwd(), input);
         output = path.join(process.cwd(), output);

         logger.on("debug", (d: string) => process.stdout.write(d + "\n"));
         logger.on("info", (i: string) => process.stdout.write(i + "\n"));
         logger.on("warn", (w: string) => process.stdout.write(w + "\n"));
         logger.on("error", (e: string) => process.stderr.write(e + "\n"));

         resize(input, output).on("end", () => writeFile(output));
       })
       .parse(process.argv);
