import dotenv from "dotenv";
import commandLineArgs from "command-line-args";

//setup command line options
const options = commandLineArgs([
    {
        name: "env",
        alias: "e",
        defaultValue: "development",
        type: String,
    },
]);

// set environment file
const result = dotenv.config({
    path: `./env/${options.env}.env`,
});
if (result.error) {
    throw result.error;
}
