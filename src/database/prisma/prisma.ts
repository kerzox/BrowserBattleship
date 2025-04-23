import { PrismaClient } from "@prisma/client";
import assert from "assert";

export const prisma = getClient();

function getClient() {
  const { DATABASE_URL } = process.env;
  assert(DATABASE_URL, "DATABASE_URL env var not set");

  const databaseUrl = new URL(DATABASE_URL);
  console.log(`🔌 setting up prisma client to ${databaseUrl.host}`);

  const client = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl.toString(),
      },
    },
  });

  // connect eagerly
  client.$connect();

  return client;
}
