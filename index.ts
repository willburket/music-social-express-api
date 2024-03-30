import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import router from './src/api/routes/UserRoutes';
import exp from 'constants';
import cors from 'cors';
// import bodyParser, { BodyParser } from 'body-parser';
// import bodyParser = require('body-parser');

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const corsOptions = {
  origin: `http://localhost:${process.env.FRONTEND_PORT}`,      // change in prod
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));
app.use('/', router);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`); 
});