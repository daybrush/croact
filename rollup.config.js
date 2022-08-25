
import builder from "@daybrush/builder";

export default builder([
    {
        input: "src/index.ts",
        output: "./dist/croact.esm.js",
        exports: "named",
        format: "es",
    },
    {
        input: "src/index.ts",
        output: "./dist/croact.cjs.js",
        exports: "named",
        format: "cjs",
    },
    {
        input: "src/index.ts",
        output: "./dist/croact.umd.js",
        name: "Croact",
        exports: "named",
        format: "umd",
        resolve: true,
        uglify: true,
    },
    {
        input: "src/index.ts",
        output: "./dist/croact.cjs2.js",
        name: "Croact",
        exports: "named",
        format: "cjs",
        resolve: true,
        uglify: true,
    },
]);
