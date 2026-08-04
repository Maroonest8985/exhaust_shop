import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let connection: ReturnType<typeof postgres> | null = null;

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL이 설정되지 않았습니다. Vercel 환경 변수를 확인해 주세요.");
  }

  connection ??= postgres(databaseUrl, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });

  return drizzle(connection, { schema });
}
