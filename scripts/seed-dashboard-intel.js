const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgresql://postgres:postgres@localhost:5432/spa",
});

async function seed() {
    try {
        console.log('🔥 IGNITING DATABASE WITH ELITE SPA DATA...');

        // 1. Clean old reservations
        await pool.query('DELETE FROM reservations');

        // 2. Fetch all required IDs
        const users = (await pool.query("SELECT id FROM users WHERE role = 'user'")).rows;
        const services = (await pool.query("SELECT id, price FROM services")).rows;
        const staff = (await pool.query("SELECT id FROM prestataires")).rows;

        if (users.length === 0 || services.length === 0) {
            console.error('❌ Missing users or services. Run migrations first.');
            return;
        }

        const userIds = users.map(u => u.id);
        const serviceIds = services.map(s => s.id);
        const staffIds = staff.map(p => p.id);

        // 3. SEED TODAY (Agenda)
        console.log('📅 Seeding Agenda for Today...');
        const now = new Date();
        // Use local hours to ensure it appears "Today" regardless of server TZ
        for (let i = 0; i < 8; i++) {
            const date = new Date(now);
            date.setHours(9 + i, (i % 2 === 0 ? 0 : 30), 0);

            await pool.query(
                "INSERT INTO reservations (user_id, service_id, prestataire_id, date, status) VALUES ($1, $2, $3, $4, $5)",
                [
                    userIds[i % userIds.length],
                    serviceIds[i % serviceIds.length],
                    staffIds[i % staffIds.length] || null,
                    date,
                    i < 6 ? 'confirmed' : 'pending'
                ]
            );
        }

        // 4. SEED HISTORIC (Revenue & Popularity)
        console.log('📊 Seeding 150+ Historical Transactions...');
        for (let i = 0; i < 150; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // Last 2 months
            date.setHours(9 + Math.floor(Math.random() * 10), Math.random() > 0.5 ? 0 : 30, 0);

            // Intentionally bias some services to make the chart look interesting
            let sIdx;
            const rand = Math.random();
            if (rand > 0.6) sIdx = 0; // Massage Royal (Most popular)
            else if (rand > 0.3) sIdx = 1; // Soin Visage
            else if (rand > 0.1) sIdx = 2; // Hammam
            else sIdx = 3; // Manucure

            await pool.query(
                "INSERT INTO reservations (user_id, service_id, prestataire_id, date, status) VALUES ($1, $2, $3, $4, $5)",
                [
                    userIds[Math.floor(Math.random() * userIds.length)],
                    serviceIds[sIdx % serviceIds.length],
                    staffIds[Math.floor(Math.random() * staffIds.length)] || null,
                    date,
                    'confirmed'
                ]
            );
        }

        // 5. SEED VIP POINTS
        console.log('✨ Boosting VIP Loyalty...');
        for (const uid of userIds) {
            const points = Math.floor(Math.random() * 5000) + 1000;
            await pool.query("UPDATE users SET points = $1 WHERE id = $2", [points, uid]);
        }

        console.log('✅ DATABASE FULLY CHARGED! Check your dashboard now.');
    } catch (err) {
        console.error('❌ Seeding error:', err);
    } finally {
        await pool.end();
    }
}

seed();
