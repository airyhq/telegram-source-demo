import * as express from "express";
import {actionRouter} from "./action";

export const addRoutes = (app) => {
    app.use("/", actionRouter);
}
