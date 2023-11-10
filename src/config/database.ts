import knex from "knex";
import * as dotenv from 'dotenv';

dotenv.config()

const PORT: number | undefined = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;
console.log(process.env.DB_USER)



const db = knex({
    client: 'mysql2',
    connection:{
        host : process.env.HOST as string,
        port : PORT,
        user : process.env.DB_USER as string,
        password : process.env.PASSWORD as string,
        database : process.env.DATABASE as string,
    }
    
});

export default db;