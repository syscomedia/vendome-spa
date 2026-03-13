const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function addLoginTable() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL');

        // Create users table
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Users table created successfully');

        // Add a default user if not exists
        const userCount = await client.query('SELECT count(*) FROM users');
        if (parseInt(userCount.rows[0].count) === 0) {
            // In a real app, password would be hashed.
            // For this initial setup, we use plain text OR user will register.
            // Let's add one admin user.
            await client.query(`
        INSERT INTO users (email, password, name) VALUES
        ('admin@vendome.com', 'admin123', 'Administrator')
      `);
            console.log('Default user created');
        }

    } catch (err) {
        console.error('Error adding users table:', err);
    } finally {
        await client.end();
    }
}

addLoginTable();
