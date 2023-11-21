require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.DB).then(() => {
  console.log("Connected to database");
  const express = require("express");

  const server = express();

  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  const apiRouter = express.Router();
  apiRouter.use("/auth", require("./auth")(express.Router()));
  apiRouter.use('/cities', require('./cities')(express.Router()));
  apiRouter.use('/trips', require('./trips')(express.Router()));
  apiRouter.use('/tickets', require('./tickets')(express.Router()));

  server.use("/api", apiRouter);

  server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});
