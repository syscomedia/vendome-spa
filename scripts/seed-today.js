const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgresql://postgres:postgres@localhost:5432/spa",
});

async function seed() {
    try {
        console.log('🔥 RE-ENERGIZING DATABASE FOR TODAY...');

        // 1. Fetch IDs
        const users = (await pool.query("SELECT id FROM users WHERE role = 'user' LIMIT 10")).rows;
        const services = (await pool.query("SELECT id FROM services LIMIT 4")).rows;
        const staff = (await pool.query("SELECT id FROM prestataires LIMIT 4")).rows;

        if (users.length === 0 || services.length === 0) {
            console.error('❌ Missing pre-requisites.');
            return;
        }

        // 2. Clear Today's Reservations to avoid duplicates if re-running
        // (Optional, but helps during testing)
        // await pool.query("DELETE FROM reservations WHERE date::date = CURRENT_DATE");

        // 3. Create HIGH PRECISION "Today" Reservations
        // We'll use multiple formats just in case
        const today = new Date();

        console.log(`📅 Creating 12 slots for TODAY: ${today.toDateString()}`);

        for (let i = 0; i < 12; i++) {
            const resDate = new Date(today);
            resDate.setHours(8 + i, 0, 0, 0); // Solid hours: 08:00, 09:00...

            await pool.query(
                "INSERT INTO reservations (user_id, service_id, prestataire_id, date, status) VALUES ($1, $2, $3, $4, $5)",
                [
                    users[i % users.length].id,
                    services[i % services.length].id,
                    staff[i % staff.length]?.id || null,
                    resDate,
                    'confirmed'
                ]
            );
        }

        console.log('✅ 12 FRESH RESERVATIONS INSERTED FOR TODAY!');

        // Check what we just did
        const check = await pool.query("SELECT count(*) FROM reservations WHERE date::date = CURRENT_DATE");
        console.log(`📊 TOTAL RESERVATIONS IN DB FOR TODAY: ${check.rows[0].count}`);

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

seed();
