/**
 * @file index.js
 * @module index
 * @description Entry point for the UCS User Management Backend application.
 * @version 1.0.0
 * @author Kizito S.M.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import "express-async-errors";
import ErrorHandler from "./helpers/error-handler.js";
// import uploadRouter from "./routes/upload-router.js";
// import authenticationRouter from "./routes/authentication-router.js";
import AuthRouter from "./modules/auth/auth-router.js";

class AppServer {
  constructor() {
    this.app = express();
    this.port = process.env.NODE_PORT || 3010;
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeMiddleware() {
    this.app.disable("x-powered-by");
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cors());
  }

  async initializeRoutes() {
    // this.app.use("/api/v1/upload", uploadRouter);
    this.app.use("/api/v1/auth", AuthRouter);
    // this.app.use("/api/v1/dashboard", dashboardRouter);
    // this.app.use("/api/v2/dashboard", dashboardRouterV2);
  }

  initializeErrorHandling() {
    const errorHandlerInstance = new ErrorHandler();
    this.app.use((err, req, res, next) => {
      errorHandlerInstance.handleError(err, req, res, next);
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log("***** INFO: UCS User Management Backend is Listening on:" + this.port + " *****");
    });
  }
}

const appServer = new AppServer();
appServer.start();

export default AppServer;
