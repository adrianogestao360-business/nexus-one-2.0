const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env.test") });

const { Client } = require("pg");

module.exports = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows } = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations'`,
  );

  const tabelas = rows.map((row) => `"${row.tablename}"`).join(", ");

  if (tabelas) {
    await client.query(`TRUNCATE TABLE ${tabelas} RESTART IDENTITY CASCADE`);
  }

  await client.end();
};
