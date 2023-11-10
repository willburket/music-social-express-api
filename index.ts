import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import router from './src/api/routes/UserRoutes';
import bodyParser = require('body-parser');

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use('/', router);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});