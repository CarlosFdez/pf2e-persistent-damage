import { task, src, dest, parallel, series, watch } from "gulp";
import * as concat from "gulp-concat";
import * as ts from "gulp-typescript";
import * as sourcemaps from "gulp-sourcemaps";
import * as sass from "gulp-sass";
import * as del from "del";
import * as path from "path";
import * as fs from "fs-extra";
import * as through from "through2";

const project = ts.createProject("src/tsconfig.json");

// Get output directory. Pulls from foundryconfig.json if it exists and falls back to dist/
const outDir = (() => {
    const configPath = path.resolve(process.cwd(), 'foundryconfig.json');
    const configData = fs.existsSync(configPath) ? fs.readJSONSync(configPath) : undefined;
    return configData !== undefined ? path.join(configData.dataPath, 'Data', 'modules', configData.moduleName) : null;
})() ?? path.join(__dirname, 'dist/');

task("clean", () => {
  return del(outDir, { force: true });
});

task("compile:ts", () => {
  return src("src/**/*.ts")
    .pipe(sourcemaps.init())
    .pipe(project())
    .pipe(sourcemaps.write())
    .pipe(dest(outDir))
});

task("compile:sass", () => {
  return src("src/styles/**/*.scss")
    .pipe(sass.sync().on("error", sass.logError))
    .pipe(dest(path.resolve(outDir, "styles")))
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
            .pipe(dest(path.resolve(outDir, "packs")));
    });

    return tasks;
})

task("compile", parallel("compile:ts", "compile:sass", "compile:packs"));

task("copy", async () => {
    const createPipe = (subPath: string) => (
        src(`src/${subPath}/**`).pipe(dest(path.resolve(outDir, subPath)))
    );

    return new Promise<void>((resolve) => {
        src("README.md").pipe(dest(outDir));
        src("src/module.json").pipe(dest(outDir));
        createPipe("lang");
        createPipe("templates");
        createPipe("assets");
        src("src/styles/**/*.css").pipe(dest(path.resolve(outDir, "styles/")));
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
