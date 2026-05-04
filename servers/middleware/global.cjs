const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const globalMiddleware = (app) => {
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.use(cors({ origin: true, credentials: true }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
  // JSON parser for everything EXCEPT webhook (which uses raw body)
  app.use(express.json({ limit: "1mb" }));
};

module.exports = globalMiddleware;