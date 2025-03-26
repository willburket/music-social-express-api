import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import router from './src/api/routes/UserRoutes';
// import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
// const multerS3 = require('multer-s3')

// import bodyParser from 'body-parser';         // delete potentially

import cors from 'cors';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;


const corsOptions = {
  // origin: `http://localhost:${process.env.FRONTEND_PORT}`, // change in prod
  origin: `${process.env.CORS_ORIGIN}`, // change in local
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};


app.use(cors(corsOptions));

app.use((req, res, next) => {

  if (req.headers["content-type"] === "application/json") {
    express.json({ limit: "10mb" })(req, res, next);
  } else if (req.headers["content-type"] !== "application/json") {
    express.urlencoded({ limit: "10mb", extended: false , parameterLimit: 20000})(req, res, next);
  } else {
    next();
  }
});

app.use('/', router);



app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
