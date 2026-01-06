import * as dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL  || "";

export const config = {
    port: PORT,
    databaseUrl: DATABASE_URL,
}