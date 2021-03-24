import { task, src, dest, parallel, series, watch } from "gulp";
import * as concat from "gulp-concat";
import * as ts from "gulp-typescript";
import * as sourcemaps from "gulp-sourcemaps";
import * as sass from "gulp-sass";
import * as del from "del";
import * as path from "path";
import * as fs from "fs/promises";
import * as through from "through2";

const project = ts.createProject("src/tsconfig.json")

task("clean", () => {
  return del("dist");
});

task("compile:ts", () => {
  return src("src/**/*.ts")
    .pipe(sourcemaps.init())
    .pipe(project())
    .pipe(sourcemaps.write())
    .pipe(dest("dist/"))
});

task("compile:sass", () => {
  return src("src/styles/**/*.scss")
    .pipe(sass.sync().on("error", sass.logError))
    .pipe(dest("dist/styles"))
});

async function getFolders(dir: string) {
    const results = [];
    const folders = await fs.readdir("src/packs");
    for (const folder of folders) {
        const stat = await fs.stat(path.join(dir, folder));
        if (stat.isDirectory()) {
            results.push(folder);
        }
    }

    return folders;
}

task("compile:packs", async () => {
    const folders = await getFolders("src/packs");
    const tasks = folders.map(folder => {
        return src(path.join("src/packs/", folder, "/*.json"))
            .pipe(through.obj((file, enc, cb) => {
                const contents = file.contents.toString("utf8");
                const minimized = JSON.stringify(JSON.parse(contents));
                file.contents = Buffer.from(minimized, enc);
                cb(null, file);
            }))
            .pipe(concat(folder))
            .pipe(dest("dist/packs/"));
    });

    return tasks;
})

task("compile", parallel("compile:ts", "compile:sass", "compile:packs"));

task("copy", async () => {
  return new Promise<void>((resolve) => {
    src("README.md").pipe(dest("dist/"))
    src("src/module.json").pipe(dest("dist/"))
    src("src/lang/**").pipe(dest("dist/lang/"))
    src("src/templates/**").pipe(dest("dist/templates/"))
    src("src/styles/**/*.css").pipe(dest("dist/styles/"))
    src("src/assets/**").pipe(dest("dist/assets/"))
    resolve();
  })
});

task("build", series("clean", parallel("compile", "copy")));
task("watch", series("clean", () => {
  watch("src/**/*.ts", { ignoreInitial: false }, task("compile:ts"));
  watch("src/**/*.scss", { ignoreInitial: false }, task("compile:sass"));
  watch("src/packs/**/*.json", { ignoreInitial: false }, task("compile:packs"));
  watch("src/**/*", { ignoreInitial: false }, task("copy"));
}));
