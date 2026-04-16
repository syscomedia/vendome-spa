import { query } from '@/lib/db';

export const resolvers = {
    Query: {
        services: async () => {
            try {
                const res = await query('SELECT * FROM services');
                return res.rows.map(row => ({ ...row, price: parseFloat(row.price) }));
            } catch (e) {
                console.error('Error fetching services:', e);
                return [];
            }
        },
        service: async (_: any, { id }: any) => {
            try {
                const res = await query('SELECT * FROM services WHERE id = $1', [id]);
                const row = res.rows[0];
                if (!row) return null;
                return { ...row, price: parseFloat(row.price) };
            } catch (e) {
                console.error('Error fetching service:', e);
                return null;
            }
        },
        prestataires: async () => {
            try {
                const res = await query('SELECT id, name, role, image, rating, specialty, historique FROM prestataires');
                return res.rows;
            } catch (e) {
                console.error('Error fetching prestataires:', e);
                return [];
            }
        },
        amenities: async () => {
            try {
                const res = await query('SELECT * FROM amenities');
                return res.rows;
            } catch (e) {
                console.error('Error fetching amenities:', e);
                return [];
            }
        },
        userLoyalty: async (_: any, { userId }: any) => {
            try {
                if (!userId) {
                    return { points: 0, tier: 'Guest', nextReward: 100 };
                }
                const res = await query('SELECT points, tier FROM users WHERE id = $1', [userId]);
                const user = res.rows[0];
                if (!user) return { points: 0, tier: 'Guest', nextReward: 100 };
                
                const points = parseInt(user.points) || 0;
                // Calculate next reward: let's say every 500 points
                const nextRewardValue = 500 - (points % 500);

                return { 
                    points: points, 
                    tier: user.tier || 'Guest', 
                    nextReward: nextRewardValue 
                };
            } catch (e) {
                console.error('Error fetching user loyalty:', e);
                return { points: 0, tier: 'Guest', nextReward: 100 };
            }
        },
        serviceHistory: async () => {
            try {
                const res = await query('SELECT id, date, service, prestataire_id as "prestataireId", points FROM service_history');
                return res.rows;
            } catch (e) {
                console.error('Error fetching service history:', e);
                return [];
            }
        },
        recommendations: async () => {
            try {
                const res = await query('SELECT id, reason FROM recommendations');
                return res.rows;
            } catch (e) {
                console.error('Error fetching recommendations:', e);
                return [];
            }
        },
        me: async (_: any, __: any, context: any) => {
            // Placeholder for user session logic
            return null;
        },
        clients: async () => {
            try {
                const res = await query("SELECT id, email, name, role, points, tier, hair_color_pref, favorite_coupe, nail_color_pref, music_pref, music_link, drink_pref, skin_type, birthday, phone, coffee_pref, employee_pref, favourite_service, allergies, last_visit_notes, image FROM users ORDER BY name ASC");
                return res.rows;
            } catch (e) {
                console.error('Error fetching clients:', e);
                return [];
            }
        },
        products: async () => {
            try {
                const res = await query('SELECT * FROM products');
                return res.rows.map(row => ({ ...row, price: parseFloat(row.price) }));
            } catch (e) {
                console.error('Error fetching products:', e);
                return [];
            }
        },
        myReservations: async (_: any, { userId }: any) => {
            try {
                let queryText = `
                    SELECT 
                        r.id, r.date, r.status,
                        json_build_object('id', u.id, 'name', u.name, 'email', u.email) as user,
                        json_build_object('id', s.id, 'name', s.name, 'price', s.price, 'image', s.image, 'duration', s.duration, 'description', s.description) as service,
                        json_build_object('id', p.id, 'name', p.name, 'role', p.role, 'image', p.image, 'rating', p.rating, 'specialty', p.specialty) as prestataire
                    FROM reservations r
                    LEFT JOIN users u ON r.user_id = u.id
                    LEFT JOIN services s ON r.service_id = s.id
                    LEFT JOIN prestataires p ON r.prestataire_id = p.id
                `;
                let values: any[] = [];
                if (userId) {
                    queryText += ` WHERE r.user_id = $1 `;
                    values.push(userId);
                }
                queryText += ` ORDER BY r.date DESC `;

                const res = await query(queryText, values);
                return res.rows.map(row => ({
                    ...row,
                    date: row.date ? new Date(row.date).toISOString() : null,
                    user: row.user?.id ? row.user : null,
                    service: row.service?.id ? {
                        ...row.service,
                        price: row.service?.price ? parseFloat(row.service.price.toString().replace(/[^\d.]/g, '')) || 0 : 0
                    } : null,
                    prestataire: row.prestataire?.id ? row.prestataire : null
                }));
            } catch (e) {
                console.error('Error fetching reservations:', e);
                return [];
            }
        },
        waitingComments: async () => {
            try {
                // Return simple object, User will be resolved if structure matches or we build it here
                const res = await query(`
                    SELECT 
                        c.id, c.comment, c.created_at as "createdAt",
                        json_build_object('id', u.id, 'name', u.name, 'email', u.email) as user
                    FROM waiting_comments c
                    JOIN users u ON c.user_id = u.id
                    ORDER BY c.created_at DESC
                `);
                return res.rows;
            } catch (e) {
                console.error('Error fetching comments:', e);
                return [];
            }
        },
        personnelEvaluations: async () => {
            try {
                const res = await query(`
                    SELECT 
                        e.id, e.rating, e.comment, e.created_at as "createdAt",
                        json_build_object('id', u.id, 'name', u.name, 'email', u.email) as user,
                        json_build_object('id', p.id, 'name', p.name, 'role', p.role, 'image', p.image, 'rating', p.rating, 'specialty', p.specialty) as prestataire
                    FROM personnel_evaluations e
                    JOIN users u ON e.user_id = u.id
                    JOIN prestataires p ON e.prestataire_id = p.id
                    ORDER BY e.created_at DESC
                `);
                return res.rows;
            } catch (e) {
                console.error('Error fetching evaluations:', e);
                return [];
            }
        },
        clientNotes: async (_: any, { clientId }: any) => {
            try {
                let queryText = 'SELECT * FROM client_notes';
                const values = [];
                if (clientId) {
                    queryText += ' WHERE client_id = $1';
                    values.push(clientId);
                }
                queryText += ' ORDER BY created_at DESC';
                const res = await query(queryText, values);
                return res.rows.map(row => ({
                    ...row,
                    createdAt: row.created_at.toISOString()
                }));
            } catch (e) {
                console.error('Error fetching client notes:', e);
                return [];
            }
        },
    },
    ClientNote: {
        client: async (parent: any) => {
            const res = await query('SELECT id, email, name, role, image FROM users WHERE id = $1', [parent.client_id]);
            return res.rows[0];
        },
        author: async (parent: any) => {
            const res = await query('SELECT id, email, name, role, image FROM users WHERE id = $1', [parent.author_id]);
            return res.rows[0];
        }
    },
    Mutation: {
        login: async (_: any, { email, password }: any) => {
            try {
                const res = await query('SELECT * FROM users WHERE email = $1', [email]);
                const user = res.rows[0];
                if (!user) {
                    return { error: 'User not found' };
                }
                const bcrypt = require('bcryptjs');
                let valid = false;
                try {
                    valid = await bcrypt.compare(password, user.password);
                } catch (err) {
                    // Fallback to plain text if bcrypt fails (e.g. not a valid hash)
                    valid = password === user.password;
                }
                if (!valid && password === user.password) {
                    valid = true;
                }
                if (!valid) {
                    return { error: 'Invalid password' };
                }
                return { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
            } catch (e) {
                console.error('Login error:', e);
                return { error: 'Server error' };
            }
        },
        register: async (_: any, { email, password, name }: any) => {
            try {
                const hashedPassword = password; // Plain text as requested
                // Generate simple referral code
                const refCode = name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000);

                const res = await query(
                    "INSERT INTO users (email, password, name, role, referral_code) VALUES ($1, $2, $3, 'client', $4) RETURNING id, email, name, role",
                    [email, hashedPassword, name, refCode]
                );
                return { user: res.rows[0] };
            } catch (e: any) {
                if (e.code === '23505') {
                    return { error: 'Email already exists' };
                }
                console.error('Register error:', e);
                return { error: 'Server error' };
            }
        },
        syncGoogleUser: async (_: any, { email, name }: any) => {
            try {
                // Check if user exists
                const res = await query('SELECT * FROM users WHERE email = $1', [email]);
                let user = res.rows[0];

                if (user) {
                    return { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
                }

                // If not, create user with random password
                const crypto = require('crypto');
                const randomPassword = crypto.randomBytes(16).toString('hex');
                const hashedPassword = randomPassword; // Plain text as requested
                const refCode = name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000);

                const newRes = await query(
                    "INSERT INTO users (email, password, name, role, referral_code) VALUES ($1, $2, $3, 'client', $4) RETURNING id, email, name, role",
                    [email, hashedPassword, name, refCode]
                );
                return { user: newRes.rows[0] };
            } catch (e) {
                console.error('Sync Google User error:', e);
                return { error: 'Server error during Google Sync' };
            }
        },
        createReservation: async (_: any, { userId, serviceId, prestataireId, date }: any) => {
            try {
                const res = await query(
                    `INSERT INTO reservations (user_id, service_id, prestataire_id, date) 
                     VALUES ($1, $2, $3, $4) RETURNING id, date, status`,
                    [userId, serviceId, prestataireId, date]
                );
                // We need to return the full graph. For simplicity, fetch it back or construct it.
                // Fetching is safer.
                const fullRes = await query(`
                    SELECT 
                        r.id, r.date, r.status,
                        json_build_object('id', u.id, 'name', u.name, 'email', u.email) as user,
                        json_build_object('id', s.id, 'name', s.name, 'price', s.price, 'image', s.image, 'duration', s.duration) as service,
                        json_build_object('id', p.id, 'name', p.name, 'role', p.role, 'image', p.image, 'rating', p.rating, 'specialty', p.specialty) as prestataire
                    FROM reservations r
                    LEFT JOIN users u ON r.user_id = u.id
                    LEFT JOIN services s ON r.service_id = s.id
                    LEFT JOIN prestataires p ON r.prestataire_id = p.id
                    WHERE r.id = $1
                `, [res.rows[0].id]);

                return fullRes.rows[0];
            } catch (e) {
                console.error(e);
                throw new Error("Failed to create reservation");
            }
        },
        addWaitingComment: async (_: any, { userId, comment }: any) => {
            const res = await query(
                'INSERT INTO waiting_comments (user_id, comment) VALUES ($1, $2) RETURNING id, comment, created_at as "createdAt"',
                [userId, comment]
            );
            // Fetch user for return
            const userRes = await query('SELECT id, name, email FROM users WHERE id = $1', [userId]);

            return { ...res.rows[0], user: userRes.rows[0] };
        },
        addTip: async (_: any, { userId, prestataireId, amount }: any) => {
            await query(
                'INSERT INTO tips (user_id, prestataire_id, amount) VALUES ($1, $2, $3)',
                [userId, prestataireId, amount]
            );
            return true;
        },
        applyReferral: async (_: any, { userId, code }: any) => {
            // Find owner of code
            const ownerRes = await query('SELECT id FROM users WHERE referral_code = $1', [code]);
            if (ownerRes.rows.length === 0) return false;
            const ownerId = ownerRes.rows[0].id;

            if (parseInt(ownerId) === parseInt(userId)) return false; // Self referral

            // Update points
            await query('UPDATE users SET points = points + 10 WHERE id = $1', [ownerId]);
            // Mark user as referred
            await query('UPDATE users SET referred_by = $1 WHERE id = $2', [code, userId]);

            return true;
        },
        addService: async (_: any, { name, description, price, image, duration }: any) => {
            const res = await query(
                'INSERT INTO services (name, description, price, image, duration) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [name, description, price, image, duration]
            );
            return res.rows[0];
        },
        addPrestataire: async (_: any, { name, role, image, rating, specialty }: any) => {
            const res = await query(
                'INSERT INTO prestataires (name, role, image, rating, specialty) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [name, role, image, rating, specialty]
            );
            return res.rows[0];
        },
        addPersonnelEvaluation: async (_: any, { userId, personnelId, rating, comment }: any) => {
            try {
                await query(
                    'INSERT INTO personnel_evaluations (user_id, prestataire_id, rating, comment) VALUES ($1, $2, $3, $4)',
                    [userId, personnelId, rating, comment]
                );
                return true;
            } catch (e) {
                console.error('Error adding evaluation:', e);
                return false;
            }
        },
        deleteReservation: async (_: any, { id }: any) => {
            try {
                await query('DELETE FROM reservations WHERE id = $1', [parseInt(id)]);
                return true;
            } catch (e) {
                console.error('Error deleting reservation:', e);
                return false;
            }
        },
        toggleService: async (_: any, { id, enabled }: any) => {
            const res = await query(
                'UPDATE services SET enabled = $1 WHERE id = $2 RETURNING *',
                [enabled, id]
            );
            return { ...res.rows[0], price: parseFloat(res.rows[0].price) };
        },
        removeService: async (_: any, { id }: any) => {
            await query('DELETE FROM services WHERE id = $1', [id]);
            return true;
        },
        updateService: async (_: any, { id, name, description, price, image, duration }: any) => {
            try {
                let queryText = 'UPDATE services SET ';
                const values: any[] = [];
                const updates: string[] = [];

                if (name) {
                    updates.push(`name = $${values.length + 1}`);
                    values.push(name);
                }
                if (description) {
                    updates.push(`description = $${values.length + 1}`);
                    values.push(description);
                }
                if (price !== undefined) {
                    updates.push(`price = $${values.length + 1}`);
                    values.push(price);
                }
                if (image) {
                    updates.push(`image = $${values.length + 1}`);
                    values.push(image);
                }
                if (duration) {
                    updates.push(`duration = $${values.length + 1}`);
                    values.push(duration);
                }

                if (updates.length === 0) {
                    const res = await query('SELECT * FROM services WHERE id = $1', [id]);
                    return { ...res.rows[0], price: parseFloat(res.rows[0].price) };
                }

                queryText += updates.join(', ') + ` WHERE id = $${values.length + 1} RETURNING *`;
                values.push(id);

                const res = await query(queryText, values);
                return { ...res.rows[0], price: parseFloat(res.rows[0].price) };
            } catch (e) {
                console.error('Update service error:', e);
                throw new Error("Failed to update service");
            }
        },
        updateUserRole: async (_: any, { userId, role }: any) => {
            const res = await query(
                'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, name, role',
                [role, userId]
            );
            return res.rows[0];
        },
        removeUser: async (_: any, { userId }: any) => {
            await query('DELETE FROM users WHERE id = $1', [userId]);
            return true;
        },
        updateUser: async (_: any, { userId, email, name, role, password, tier, hair_color_pref, favorite_coupe, nail_color_pref, music_pref, music_link, drink_pref, skin_type, birthday, phone, coffee_pref, employee_pref, favourite_service, allergies, last_visit_notes, image }: any) => {
            try {
                let queryText = 'UPDATE users SET ';
                const values: any[] = [];
                const updates: string[] = [];

                if (email) {
                    updates.push(`email = $${values.length + 1}`);
                    values.push(email);
                }
                if (name) {
                    updates.push(`name = $${values.length + 1}`);
                    values.push(name);
                }
                if (role) {
                    updates.push(`role = $${values.length + 1}`);
                    values.push(role);
                }
                if (tier) {
                    updates.push(`tier = $${values.length + 1}`);
                    values.push(tier);
                }
                if (hair_color_pref !== undefined) {
                    updates.push(`hair_color_pref = $${values.length + 1}`);
                    values.push(hair_color_pref);
                }
                if (favorite_coupe !== undefined) {
                    updates.push(`favorite_coupe = $${values.length + 1}`);
                    values.push(favorite_coupe);
                }
                if (nail_color_pref !== undefined) {
                    updates.push(`nail_color_pref = $${values.length + 1}`);
                    values.push(nail_color_pref);
                }
                if (music_pref !== undefined) {
                    updates.push(`music_pref = $${values.length + 1}`);
                    values.push(music_pref);
                }
                if (music_link !== undefined) {
                    updates.push(`music_link = $${values.length + 1}`);
                    values.push(music_link);
                }
                if (drink_pref !== undefined) {
                    updates.push(`drink_pref = $${values.length + 1}`);
                    values.push(drink_pref);
                }
                if (skin_type !== undefined) {
                    updates.push(`skin_type = $${values.length + 1}`);
                    values.push(skin_type);
                }
                if (birthday !== undefined) {
                    updates.push(`birthday = $${values.length + 1}`);
                    values.push(birthday);
                }
                if (phone !== undefined) {
                    updates.push(`phone = $${values.length + 1}`);
                    values.push(phone);
                }
                if (coffee_pref !== undefined) {
                    updates.push(`coffee_pref = $${values.length + 1}`);
                    values.push(coffee_pref);
                }
                if (employee_pref !== undefined) {
                    updates.push(`employee_pref = $${values.length + 1}`);
                    values.push(employee_pref);
                }
                if (favourite_service !== undefined) {
                    updates.push(`favourite_service = $${values.length + 1}`);
                    values.push(favourite_service);
                }
                if (allergies !== undefined) {
                    updates.push(`allergies = $${values.length + 1}`);
                    values.push(allergies);
                }
                if (last_visit_notes !== undefined) {
                    updates.push(`last_visit_notes = $${values.length + 1}`);
                    values.push(last_visit_notes);
                }
                if (image !== undefined) {
                    updates.push(`image = $${values.length + 1}`);
                    values.push(image);
                }
                if (password) {
                    updates.push(`password = $${values.length + 1}`);
                    values.push(password); // Note: still plain text per previous requirements
                }

                if (updates.length === 0) {
                    const res = await query('SELECT id, email, name, role, points, tier, hair_color_pref, favorite_coupe, nail_color_pref, music_pref, music_link, drink_pref, skin_type, birthday, phone, coffee_pref, employee_pref, favourite_service, allergies, last_visit_notes, image FROM users WHERE id = $1', [userId]);
                    return res.rows[0];
                }

                queryText += updates.join(', ') + ` WHERE id = $${values.length + 1} RETURNING id, email, name, role, points, tier, hair_color_pref, favorite_coupe, nail_color_pref, music_pref, music_link, drink_pref, skin_type, birthday, phone, coffee_pref, employee_pref, favourite_service, allergies, last_visit_notes, image`;
                values.push(userId);

                const res = await query(queryText, values);
                return res.rows[0];
            } catch (e) {
                console.error('Update user error:', e);
                throw new Error("Failed to update user");
            }
        },
        addProduct: async (_: any, { name, description, price, image }: any) => {
            const res = await query(
                'INSERT INTO products (name, description, price, image) VALUES ($1, $2, $3, $4) RETURNING *',
                [name, description, price, image]
            );
            return { ...res.rows[0], price: parseFloat(res.rows[0].price) };
        },
        updateProduct: async (_: any, { id, name, description, price, image }: any) => {
            try {
                let queryText = 'UPDATE products SET ';
                const values: any[] = [];
                const updates: string[] = [];

                if (name) {
                    updates.push(`name = $${values.length + 1}`);
                    values.push(name);
                }
                if (description) {
                    updates.push(`description = $${values.length + 1}`);
                    values.push(description);
                }
                if (price !== undefined) {
                    updates.push(`price = $${values.length + 1}`);
                    values.push(price);
                }
                if (image) {
                    updates.push(`image = $${values.length + 1}`);
                    values.push(image);
                }

                if (updates.length === 0) {
                    const res = await query('SELECT * FROM products WHERE id = $1', [id]);
                    return { ...res.rows[0], price: parseFloat(res.rows[0].price) };
                }

                queryText += updates.join(', ') + ` WHERE id = $${values.length + 1} RETURNING *`;
                values.push(id);

                const res = await query(queryText, values);
                return { ...res.rows[0], price: parseFloat(res.rows[0].price) };
            } catch (e) {
                console.error('Update product error:', e);
                throw new Error("Failed to update product");
            }
        },
        removeProduct: async (_: any, { id }: any) => {
            await query('DELETE FROM products WHERE id = $1', [id]);
            return true;
        },
        updateSpecialist: async (_: any, { id, name, role, image, specialty, rating, historique }: any) => {
            try {
                let queryText = 'UPDATE prestataires SET ';
                const values: any[] = [];
                const updates: string[] = [];

                if (name) { updates.push(`name = $${values.length + 1}`); values.push(name); }
                if (role) { updates.push(`role = $${values.length + 1}`); values.push(role); }
                if (image) { updates.push(`image = $${values.length + 1}`); values.push(image); }
                if (specialty) { updates.push(`specialty = $${values.length + 1}`); values.push(specialty); }
                if (rating !== undefined) { updates.push(`rating = $${values.length + 1}`); values.push(rating); }
                if (historique !== undefined) { updates.push(`historique = $${values.length + 1}`); values.push(historique); }

                if (updates.length === 0) {
                    const res = await query('SELECT * FROM prestataires WHERE id = $1', [id]);
                    return res.rows[0];
                }

                queryText += updates.join(', ') + ` WHERE id = $${values.length + 1} RETURNING *`;
                values.push(id);

                const res = await query(queryText, values);
                return res.rows[0];
            } catch (e) {
                console.error('Update specialist error:', e);
                throw new Error("Failed to update specialist");
            }
        },
        updateReservationStatus: async (_: any, { id, status, paymentMode }: any) => {
            try {
                let queryText = 'UPDATE reservations SET status = $1';
                const values = [status, id];
                if (paymentMode) {
                    queryText += ', payment_mode = $3';
                    values.push(paymentMode);
                }
                queryText += ' WHERE id = $2 RETURNING id, status, payment_mode as "paymentMode"';
                
                await query(queryText, values);
                
                const fullRes = await query(`
                    SELECT 
                        r.id, r.date, r.status, r.payment_mode as "paymentMode",
                        json_build_object('id', u.id, 'name', u.name, 'email', u.email) as user,
                        json_build_object('id', s.id, 'name', s.name, 'price', s.price, 'image', s.image, 'duration', s.duration) as service,
                        json_build_object('id', p.id, 'name', p.name, 'role', p.role, 'image', p.image, 'rating', p.rating, 'specialty', p.specialty) as prestataire
                    FROM reservations r
                    LEFT JOIN users u ON r.user_id = u.id
                    LEFT JOIN services s ON r.service_id = s.id
                    LEFT JOIN prestataires p ON r.prestataire_id = p.id
                    WHERE r.id = $1
                `, [id]);
                return fullRes.rows[0];
            } catch (e) {
                console.error(e);
                throw new Error("Failed to update reservation status");
            }
        },
        addClientNote: async (_: any, { clientId, authorId, content }: any) => {
            try {
                const res = await query(
                    'INSERT INTO client_notes (client_id, author_id, content) VALUES ($1, $2, $3) RETURNING *',
                    [clientId, authorId, content]
                );
                return {
                    ...res.rows[0],
                    createdAt: res.rows[0].created_at.toISOString()
                };
            } catch (e) {
                console.error('Error adding client note:', e);
                throw new Error("Failed to add client note");
            }
        }
    },
};
