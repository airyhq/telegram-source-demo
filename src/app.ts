require('dotenv').config();

import {addWebhook} from "./telegram/bot";

import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

import {addRoutes} from "./routes";

export const app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

addRoutes(app)


addWebhook(app).then(() => {

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        next(createError(404));
    });

    // error handler
    app.use((err, req, res, next) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    })
}).catch((error) => {
    console.error("Failed to setup bots and webhooks:");
    console.error(error);
    process.exit(1);
})
