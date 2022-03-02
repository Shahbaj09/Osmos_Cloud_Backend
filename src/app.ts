import "./shared/loadEnv";
import "reflect-metadata";
import { Database } from "./DB/db";
import cookieParser from "cookie-parser";
import logger from "morgan";
import path from "path";
import fileUpload from "express-fileupload";
import express, { Request, Response, NextFunction } from "express";
import swaggerUi, { SwaggerOptions } from "swagger-ui-express";
import swaggerJSDoc from 'swagger-jsdoc';
import baseRouter from "./routes";

//Init express
const app = express();

//DB initialization
Database.getDBInstance();

//Define swagger configurations
const swaggerOptions: SwaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "NODEjs Test",
            description: "",
            contact: {
                name: "Raghav Dewett",
                email: ""
            },
            servers: [`${process.env.BACKEND_HOST}`]
        },
        securityDefinitions: {
            Bearer: {
                type: "apiKey",
                name: "Authorization",
                in: "header"
            }
        }
    },
    apis: ["**/*.ts"]
};

app.use(express.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
}));
const staticDir = path.join(__dirname, "public");
app.use(express.static(staticDir));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(function (req: Request, res: Response, next: NextFunction) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    req.headers["x-forward-for"];
    next();
});
//using morgan to get server logs in command line
app.use(logger("dev"));
//defined base router to access further endpoints
app.use("/api", baseRouter);
//swagger initialization
const swaggerDocument = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    console.log(err.message, err);
});

//if application tries to access invalid endpoint, this will return 404 status code
app.get("*", function (req: Request, res: Response) {
    res.json({
        status: false,
        error: "Error 404",
    });
});

//starting server
app.listen(process.env.PORT, function () {
    console.log(`Server Started with ${process.env.ENV} environment at ${process.env.PORT} port`);
});

export default app;