import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import router from './src/api/routes/UserRoutes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

// app.get('/', (req: Request, res: Response) => {
//   res.send('Express + TypeScript Server');
// });
app.use('/', router);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});