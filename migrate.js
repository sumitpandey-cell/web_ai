#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const getDatabaseUrl = () => {
  const provider = process.env.DB_PROVIDER || "supabase";
  
  if (provider === "local") {
    return `postgres://${process.env.LOCAL_DB_USER}:${process.env.LOCAL_DB_PASSWORD}@${process.env.LOCAL_DB_HOST}:${process.env.LOCAL_DB_PORT}/${process.env.LOCAL_DB_NAME}`;
  }

  const url = `postgres://${process.env.SUPABASE_DB_USER}:${process.env.SUPABASE_DB_PASSWORD}@${process.env.SUPABASE_DB_HOST}:${process.env.SUPABASE_DB_PORT}/${process.env.SUPABASE_DB_NAME}`;
  return url;
};

async function runMigrations() {
  const connectionString = getDatabaseUrl();
  
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
  });

  try {
    console.log('🔄 Connecting to Supabase database...');
    const client = await pool.connect();
    console.log('✅ Connected!');

    // Read migration SQL
    const migrationPath = path.join(__dirname, 'src/drizzle/migrations/0000_many_speed_demon.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('🔄 Running migration...');
    await client.query(sql);
    console.log('✅ Migration completed successfully!');

    client.release();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection refused. Check your database credentials in .env');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
