import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "./config";
import { PrismaClient } from "@prisma/client";

const connectionString = config.databaseUrl;

const adapter = new PrismaPg({ connectionString });
const PrismaAdapter = new PrismaClient({ adapter });

export default PrismaAdapter;
