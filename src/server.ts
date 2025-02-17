/**
 * Module dependencies.
 */
import * as express from "express";
import * as compression from "compression";  // compresses requests
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as errorHandler from "errorhandler";
import * as lusca from "lusca";
import * as dotenv from "dotenv";
import * as path from "path";
import "reflect-metadata";
import * as cookieParser from "cookie-parser";
import moment = require("moment");
import { AppDataSource } from "./index";
import { Global } from "./config/Global";
const flash = require("express-flash");
const i18n = require("i18n");
import userRoute from "./routes/v1/usersRoutes";

/**
 * Load controllers
 */
// import * as userController from "./controllers/userController";

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });

/**
 * Create the database connection, create the tables after the models
 */

AppDataSource.initialize().then(connection => {

    /**
     * Create Express server.
     */
    const app = express();

    const corsOptions = {
        origin: "https://cosmaapi.rrsolutionstest.it",
        allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token"],
        methods: "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS",
        exposedHeaders: ["Access-Token", "Uid", "X-Access-Token"]
    };
    /**
     * Express configuration.
     */
    app.set("port", process.env.PORT || 4000);
    app.use(compression());
    // app.use(logger("dev"));
    const morgan = require("morgan");
    morgan.format("currentDateTime", function () {
        return moment().format(Global.UTC_DATE_TIME_FORMAT);
    });
    morgan.token("statusColor", (req: any, res: any, args: any) => {
        // get the status code if response written
        const status = (typeof res.headersSent !== "boolean" ? Boolean(res.header) : res.headersSent)
            ? res.statusCode
            : undefined;

        // get status color
        const color = status >= 500 ? 31 // red
            : status >= 400 ? 33 // yellow
                : status >= 300 ? 36 // cyan
                    : status >= 200 ? 32 // green
                        : 0; // no color

        return "\x1b[" + color + "m" + status + "\x1b[0m";
    });
    app.use(morgan(`[:currentDateTime] \x1b[33m:method \x1b[0m\x1b[36m:url\x1b[0m  :statusColor :response-time ms - :res[content-length]`));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(flash());
    app.use(lusca.xframe("SAMEORIGIN"));
    app.use(lusca.xssProtection(true));
    app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));
    app.use(cors(corsOptions));
    app.use(cookieParser());

    /**
     * Routes
     */
    // app.use("/api/v1/client", require("./routes/v1/api_client_routes"));
    app.use("/api/v1/auth" , userRoute);

    /**
     * Error Handler. Provides full stack - remove for production
     */
    app.use(errorHandler());

    /**
     * Start Express server.
     */
    app.listen(app.get("port"), () => {
        console.log(("App is running at http://localhost:%d in %s mode"), app.get("port"), app.get("env"));
        console.log("Press CTRL-C to stop\n");
    });

    i18n.configure({
        locales: ["en", "de", "it"],
        directory: "./src/public/locales",
        objectNotation: true,
    });

    module.exports = app;
}).catch(error => console.log(error));
