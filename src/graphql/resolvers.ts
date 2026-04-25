import { query } from '@/lib/db';
import {
    createGoogleCalendarEvent,
    listGoogleCalendarEvents,
    getAuthorizedGoogleClient
} from '@/lib/google-calendar';

export const resolvers = {
    Query: {
        services: async () => {
            try {
                const res = await query('SELECT * FROM services');
                return res.rows.map(row => ({ 
                    ...row, 
                    price: parseFloat(row.price) || 0,
                    price_homme: parseFloat(row.price_homme) || 0,
                    price_femme: parseFloat(row.price_femme) || 0,
                    categoryId: row.category_id 
                }));
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
                return { 
                    ...row, 
                    price: parseFloat(row.price) || 0,
                    price_homme: parseFloat(row.price_homme) || 0,
                    price_femme: parseFloat(row.price_femme) || 0,
                    categoryId: row.category_id
                };
            } catch (e) {
                console.error('Error fetching service:', e);
                return null;
            }
        },
        prestataires: async (_: any, { serviceId }: any) => {
            try {
                let queryText = 'SELECT id, name, role, image, rating, specialty, historique, calendar_color_id, service_id FROM specialistes';
                const values: any[] = [];
                if (serviceId) {
                    queryText += ' WHERE service_id = $1';
                    values.push(serviceId);
                }
                const res = await query(queryText, values);
                return res.rows.map(row => ({
                    ...row,
                    service_id: row.service_id
                }));
            } catch (e) {
                console.error('Error fetching specialists:', e);
                return [];
            }
        },
        prestataire: async (_: any, { id }: any) => {
            try {
                const res = await query('SELECT id, name, role, image, rating, specialty, historique, calendar_color_id, service_id FROM specialistes WHERE id = $1', [id]);
                const row = res.rows[0];
                if (!row) return null;
                return {
                    ...row,
                    service_id: row.service_id
                };
            } catch (e) {
                console.error('Error fetching specialist:', e);
                return null;
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
                const res = await query('SELECT points, tier, referral_code, referred_by_id FROM users WHERE id = $1', [userId]);
                const user = res.rows[0];
                if (!user) return { points: 0, tier: 'Guest', nextReward: 100 };

                const points = parseInt(user.points) || 0;
                // Calculate next reward: let's say every 500 points
                const nextRewardValue = 500 - (points % 500);

                return {
                    points: points,
                    tier: user.tier || 'Guest',
                    nextReward: nextRewardValue,
                    referral_code: user.referral_code,
                    referred_by_id: user.referred_by_id
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
                const res = await query("SELECT id, email, name, role, points, tier, password, hair_color_pref, favorite_coupe, nail_color_pref, music_pref, music_link, drink_pref, skin_type, birthday, phone, coffee_pref, employee_pref, favourite_service, allergies, last_visit_notes, image, is_blocked, referral_code, referred_by_id FROM users ORDER BY name ASC");
                return res.rows.map(row => ({
                    ...row,
                    referred_by_id: row.referred_by_id
                }));
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
                        r.id, r.date, r.status, r.duration, r.total_price, r.external_title as "externalTitle", r.google_event_id, r.payment_mode as "paymentMode", r.drink_choice, r.genre,
                        json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'drink_pref', u.drink_pref) as user,
                        json_build_object('id', s.id, 'name', s.name, 'price', s.price, 'image', s.image, 'duration', s.duration, 'description', s.description, 'visibility', s.visibility) as service,
                        json_build_object('id', p.id, 'name', p.name, 'role', p.role, 'image', p.image, 'rating', p.rating, 'specialty', p.specialty, 'calendar_color_id', p.calendar_color_id) as prestataire
                    FROM reservations r
                    LEFT JOIN users u ON r.user_id = u.id
                    LEFT JOIN services s ON r.service_id = s.id
                    LEFT JOIN specialistes p ON r.prestataire_id = p.id
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
                    duration: row.duration,
                    total_price: row.total_price ? parseFloat(row.total_price.toString()) : 0,
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
                        json_build_object('id', p.id, 'name', p.name, 'role', p.role, 'image', p.image, 'rating', p.rating, 'specialty', p.specialty, 'calendar_color_id', p.calendar_color_id) as prestataire
                    FROM personnel_evaluations e
                    JOIN users u ON e.user_id = u.id
                    JOIN specialistes p ON e.prestataire_id = p.id
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
        externalEvents: async () => {
            try {
                const res = await query(`
                    SELECT e.id, e.google_event_id, e.title, e.start_date as "startDate", e.end_date as "endDate", e.reservation_id as "reservationId" 
                    FROM external_events e
                    WHERE e.google_event_id NOT IN (
                        SELECT google_event_id FROM reservations WHERE google_event_id IS NOT NULL
                    )
                    ORDER BY e.start_date ASC
                `);
                return res.rows.map(row => ({
                    ...row,
                    startDate: row.startDate.toISOString(),
                    endDate: row.endDate?.toISOString()
                }));
            } catch (e) {
                console.error('Error fetching external events:', e);
                return [];
            }
        },
        allDrinks: async () => {
            try {
                const res = await query('SELECT * FROM drinks WHERE available = TRUE ORDER BY name ASC');
                return res.rows;
            } catch (e) {
                console.error('Error fetching drinks:', e);
                return [];
            }
        },
        serviceCategories: async () => {
            try {
                const res = await query('SELECT * FROM service_categories ORDER BY name ASC');
                return res.rows;
            } catch (e) {
                console.error('Error fetching service categories:', e);
                return [];
            }
        }
    },
    Service: {
        category: async (parent: any) => {
            if (!parent.categoryId) return null;
            try {
                const res = await query('SELECT * FROM service_categories WHERE id = $1', [parent.categoryId]);
                return res.rows[0];
            } catch (e) {
                console.error(e);
                return null;
            }
        }
    },
    ServiceCategory: {
        services: async (parent: any) => {
            try {
                const res = await query('SELECT * FROM services WHERE category_id = $1', [parent.id]);
                return res.rows.map((row: any) => ({ 
                    ...row, 
                    price: parseFloat(row.price) || 0,
                    price_homme: parseFloat(row.price_homme) || 0,
                    price_femme: parseFloat(row.price_femme) || 0,
                    categoryId: row.category_id 
                }));
            } catch (e) {
                console.error(e);
                return [];
            }
        }
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
    Prestataire: {
        evaluations: async (parent: any) => {
            const res = await query(`
                SELECT 
                    e.id, e.rating, e.comment, e.created_at as "createdAt",
                    json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'image', u.image) as user
                FROM personnel_evaluations e
                JOIN users u ON e.user_id = u.id
                WHERE e.prestataire_id = $1
                ORDER BY e.created_at DESC
            `, [parent.id]);
            return res.rows;
        },
        service: async (parent: any) => {
            if (!parent.service_id) return null;
            const res = await query('SELECT * FROM services WHERE id = $1', [parent.service_id]);
            const row = res.rows[0];
            if (!row) return null;
            return { 
                ...row, 
                price: parseFloat(row.price) || 0,
                price_homme: parseFloat(row.price_homme) || 0,
                price_femme: parseFloat(row.price_femme) || 0
            };
        }
    },
    UserLoyalty: {
        referred_by: async (parent: any) => {
            if (!parent.referred_by_id) return null;
            const res = await query('SELECT id, email, name, role, image FROM users WHERE id = $1', [parent.referred_by_id]);
            return res.rows[0];
        }
    },
    User: {
        referred_by: async (parent: any) => {
            if (!parent.referred_by_id) return null;
            const res = await query('SELECT id, email, name, role, image FROM users WHERE id = $1', [parent.referred_by_id]);
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
                if (user.is_blocked) {
                    return { error: 'il faut consulter administrateur' };
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
                    if (user.is_blocked) {
                        return { error: 'il faut consulter administrateur' };
                    }
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
        createReservation: async (_: any, { userId, serviceId, prestataireId, date, duration, totalPrice, genre }: any) => {
            try {
                const res = await query(
                    `INSERT INTO reservations (user_id, service_id, prestataire_id, date, duration, total_price, genre) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, date, status`,
                    [userId, serviceId, prestataireId, date, duration, totalPrice, genre]
                );
                // We need to return the full graph. For simplicity, fetch it back or construct it.
                // Fetching is safer.
                const fullRes = await query(`
                    SELECT 
                        r.id, r.date, r.status, r.external_title as "externalTitle", r.google_event_id, r.payment_mode as "paymentMode", r.duration, r.total_price, r.drink_choice, r.genre,
                        json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'drink_pref', u.drink_pref) as user,
                        json_build_object('id', s.id, 'name', s.name, 'price', s.price, 'image', s.image, 'duration', s.duration) as service,
                        json_build_object('id', p.id, 'name', p.name, 'role', p.role, 'image', p.image, 'rating', p.rating, 'specialty', p.specialty, 'calendar_color_id', p.calendar_color_id) as prestataire
                    FROM reservations r
                    LEFT JOIN users u ON r.user_id = u.id
                    LEFT JOIN services s ON r.service_id = s.id
                    LEFT JOIN specialistes p ON r.prestataire_id = p.id
                    WHERE r.id = $1
                `, [res.rows[0].id]);

                return {
                    ...fullRes.rows[0],
                    date: fullRes.rows[0].date ? new Date(fullRes.rows[0].date).toISOString() : null
                };
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
        generateReferralCode: async (_: any, { userId }: any) => {
            const userRes = await query('SELECT referral_code FROM users WHERE id = $1', [userId]);
            if (userRes.rows[0]?.referral_code) {
                const res = await query('SELECT * FROM users WHERE id = $1', [userId]);
                return res.rows[0];
            }
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            await query('UPDATE users SET referral_code = $1 WHERE id = $2', [code, userId]);
            const res = await query('SELECT * FROM users WHERE id = $1', [userId]);
            return res.rows[0];
        },
        applyReferralCode: async (_: any, { userId, code }: any) => {
            // Find owner of code
            const ownerRes = await query('SELECT id FROM users WHERE referral_code = $1', [code]);
            if (ownerRes.rows.length === 0) throw new Error('Code invalide');
            const ownerId = ownerRes.rows[0].id;

            if (String(ownerId) === String(userId)) throw new Error('Auto-parrainage impossible');

            // Mark user as referred
            await query('UPDATE users SET referred_by_id = $1 WHERE id = $2', [ownerId, userId]);

            const res = await query('SELECT * FROM users WHERE id = $1', [userId]);
            return res.rows[0];
        },
        addService: async (_: any, { name, description, price, price_homme, price_femme, image, duration, visibility, categoryId }: any) => {
            const res = await query(
                'INSERT INTO services (name, description, price, price_homme, price_femme, image, duration, visibility, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, name, description, price, price_homme, price_femme, image, duration, enabled, visibility, category_id as "categoryId"',
                [name, description, price, price_homme, price_femme, image, duration, visibility || 'both', categoryId]
            );
            return {
                ...res.rows[0],
                price: parseFloat(res.rows[0].price) || 0,
                price_homme: parseFloat(res.rows[0].price_homme) || 0,
                price_femme: parseFloat(res.rows[0].price_femme) || 0
            };
        },
        addServiceCategory: async (_: any, { name }: any) => {
            const res = await query(
                'INSERT INTO service_categories (name) VALUES ($1) RETURNING *',
                [name]
            );
            return res.rows[0];
        },
        addPrestataire: async (_: any, { name, role, image, rating, specialty, satisfied_clients, tech_expertise, hosp_expertise, prec_expertise, award_badge, calendar_color_id, serviceId }: any) => {
            const res = await query(
                'INSERT INTO specialistes (name, role, image, rating, specialty, satisfied_clients, tech_expertise, hosp_expertise, prec_expertise, award_badge, calendar_color_id, service_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
                [name, role, image, rating, specialty, satisfied_clients, tech_expertise, hosp_expertise, prec_expertise, award_badge, calendar_color_id, serviceId]
            );
            return {
                ...res.rows[0],
                service_id: res.rows[0].service_id
            };
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
            return { 
                ...res.rows[0], 
                price: parseFloat(res.rows[0].price) || 0,
                price_homme: parseFloat(res.rows[0].price_homme) || 0,
                price_femme: parseFloat(res.rows[0].price_femme) || 0
            };
        },
        removeService: async (_: any, { id }: any) => {
            await query('DELETE FROM services WHERE id = $1', [id]);
            return true;
        },
        updateService: async (_: any, { id, name, description, price, price_homme, price_femme, image, duration, visibility, categoryId }: any) => {
            try {
                let queryText = 'UPDATE services SET ';
                const values: any[] = [];
                const updates: string[] = [];

                if (name !== undefined) {
                    updates.push(`name = $${values.length + 1}`);
                    values.push(name);
                }
                if (description !== undefined) {
                    updates.push(`description = $${values.length + 1}`);
                    values.push(description);
                }
                if (price !== undefined) {
                    updates.push(`price = $${values.length + 1}`);
                    values.push(price);
                }
                if (price_homme !== undefined) {
                    updates.push(`price_homme = $${values.length + 1}`);
                    values.push(price_homme);
                }
                if (price_femme !== undefined) {
                    updates.push(`price_femme = $${values.length + 1}`);
                    values.push(price_femme);
                }
                if (image !== undefined) {
                    updates.push(`image = $${values.length + 1}`);
                    values.push(image);
                }
                if (duration !== undefined) {
                    updates.push(`duration = $${values.length + 1}`);
                    values.push(duration);
                }
                if (visibility !== undefined) {
                    updates.push(`visibility = $${values.length + 1}`);
                    values.push(visibility);
                }
                if (categoryId !== undefined) {
                    updates.push(`category_id = $${values.length + 1}`);
                    values.push(categoryId);
                }

                if (updates.length === 0) {
                    const res = await query('SELECT * FROM services WHERE id = $1', [id]);
                    return {
                        ...res.rows[0],
                        price: parseFloat(res.rows[0].price),
                        price_homme: parseFloat(res.rows[0].price_homme),
                        price_femme: parseFloat(res.rows[0].price_femme)
                    };
                }

                queryText += updates.join(', ') + ` WHERE id = $${values.length + 1} RETURNING *`;
                values.push(id);

                const res = await query(queryText, values);
                return {
                    ...res.rows[0],
                    price: parseFloat(res.rows[0].price) || 0,
                    price_homme: parseFloat(res.rows[0].price_homme) || 0,
                    price_femme: parseFloat(res.rows[0].price_femme) || 0,
                    categoryId: res.rows[0].category_id
                };
            } catch (e) {
                console.error('Update service error:', e);
                throw new Error("Failed to update service");
            }
        },
        updateServiceCategory: async (_: any, { id, name }: any) => {
            const res = await query(
                'UPDATE service_categories SET name = $1 WHERE id = $2 RETURNING *',
                [name, id]
            );
            return res.rows[0];
        },
        removeServiceCategory: async (_: any, { id }: any) => {
            try {
                // Set category_id to null for services in this category
                await query('UPDATE services SET category_id = NULL WHERE category_id = $1', [id]);
                await query('DELETE FROM service_categories WHERE id = $1', [id]);
                return true;
            } catch (e) {
                console.error(e);
                return false;
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
        updateUser: async (_: any, { userId, email, name, role, password, tier, hair_color_pref, favorite_coupe, nail_color_pref, music_pref, music_link, drink_pref, skin_type, birthday, phone, coffee_pref, employee_pref, favourite_service, allergies, last_visit_notes, image, is_blocked }: any) => {
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
                if (is_blocked !== undefined) {
                    updates.push(`is_blocked = $${values.length + 1}`);
                    values.push(is_blocked);
                }
                if (password) {
                    updates.push(`password = $${values.length + 1}`);
                    values.push(password); // Note: still plain text per previous requirements
                }

                if (updates.length === 0) {
                    const res = await query('SELECT id, email, name, role, points, tier, hair_color_pref, favorite_coupe, nail_color_pref, music_pref, music_link, drink_pref, skin_type, birthday, phone, coffee_pref, employee_pref, favourite_service, allergies, last_visit_notes, image, is_blocked FROM users WHERE id = $1', [userId]);
                    return res.rows[0];
                }

                queryText += updates.join(', ') + ` WHERE id = $${values.length + 1} RETURNING id, email, name, role, points, tier, hair_color_pref, favorite_coupe, nail_color_pref, music_pref, music_link, drink_pref, skin_type, birthday, phone, coffee_pref, employee_pref, favourite_service, allergies, last_visit_notes, image, is_blocked`;
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

                if (name !== undefined) {
                    updates.push(`name = $${values.length + 1}`);
                    values.push(name);
                }
                if (description !== undefined) {
                    updates.push(`description = $${values.length + 1}`);
                    values.push(description);
                }
                if (price !== undefined) {
                    updates.push(`price = $${values.length + 1}`);
                    values.push(price);
                }
                if (image !== undefined) {
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
        toggleProduct: async (_: any, { id, is_active }: any) => {
            const res = await query(
                'UPDATE products SET is_active = $1 WHERE id = $2 RETURNING *',
                [is_active, id]
            );
            return { ...res.rows[0], price: parseFloat(res.rows[0].price) };
        },
        updateSpecialist: async (_: any, { id, name, role, image, specialty, rating, historique, satisfied_clients, tech_expertise, hosp_expertise, prec_expertise, award_badge, calendar_color_id, serviceId }: any) => {
            try {
                let queryText = 'UPDATE specialistes SET ';
                const values: any[] = [];
                const updates: string[] = [];

                if (name !== undefined) { updates.push(`name = $${values.length + 1}`); values.push(name); }
                if (role !== undefined) { updates.push(`role = $${values.length + 1}`); values.push(role); }
                if (image !== undefined) { updates.push(`image = $${values.length + 1}`); values.push(image); }
                if (specialty !== undefined) { updates.push(`specialty = $${values.length + 1}`); values.push(specialty); }
                if (rating !== undefined) { updates.push(`rating = $${values.length + 1}`); values.push(rating); }
                if (historique !== undefined) { updates.push(`historique = $${values.length + 1}`); values.push(historique); }
                if (satisfied_clients !== undefined) { updates.push(`satisfied_clients = $${values.length + 1}`); values.push(satisfied_clients); }
                if (tech_expertise !== undefined) { updates.push(`tech_expertise = $${values.length + 1}`); values.push(tech_expertise); }
                if (hosp_expertise !== undefined) { updates.push(`hosp_expertise = $${values.length + 1}`); values.push(hosp_expertise); }
                if (prec_expertise !== undefined) { updates.push(`prec_expertise = $${values.length + 1}`); values.push(prec_expertise); }
                if (award_badge !== undefined) { updates.push(`award_badge = $${values.length + 1}`); values.push(award_badge); }
                if (calendar_color_id !== undefined) { updates.push(`calendar_color_id = $${values.length + 1}`); values.push(calendar_color_id); }
                if (serviceId !== undefined) { updates.push(`service_id = $${values.length + 1}`); values.push(serviceId); }

                if (updates.length === 0) {
                    const res = await query('SELECT * FROM specialistes WHERE id = $1', [id]);
                    return { ...res.rows[0], service_id: res.rows[0].service_id };
                }

                queryText += updates.join(', ') + ` WHERE id = $${values.length + 1} RETURNING *`;
                values.push(id);

                const res = await query(queryText, values);
                return { ...res.rows[0], service_id: res.rows[0].service_id };
            } catch (e) {
                console.error('Update specialist error:', e);
                throw new Error("Failed to update specialist");
            }
        },
        deleteSpecialist: async (_: any, { id }: any) => {
            try {
                await query('DELETE FROM specialistes WHERE id = $1', [id]);
                return true;
            } catch (e) {
                console.error('Error deleting specialist:', e);
                return false;
            }
        },
        deductPoints: async (_: any, { userId, points }: any) => {
            try {
                const res = await query(
                    'UPDATE users SET points = GREATEST(0, points - $1) WHERE id = $2 RETURNING id, email, name, role, points, tier, password, hair_color_pref, favorite_coupe, nail_color_pref, music_pref, music_link, drink_pref, skin_type, birthday, phone, coffee_pref, employee_pref, favourite_service, allergies, last_visit_notes, image',
                    [points, userId]
                );
                return res.rows[0];
            } catch (e) {
                console.error('Error deducting points:', e);
                throw e;
            }
        },
        purchaseProduct: async (_: any, { userId, productId }: any) => {
            try {
                // Fetch product price
                const prodRes = await query('SELECT price FROM products WHERE id = $1', [productId]);
                if (prodRes.rows.length === 0) return false;
                const price = parseFloat(prodRes.rows[0].price);

                // Calculate points (10 DT = 1 point)
                const pointsToAdd = Math.floor(price / 10);

                if (pointsToAdd > 0) {
                    await query('UPDATE users SET points = points + $1 WHERE id = $2', [pointsToAdd, userId]);

                    // Add to service_history (optional but good for tracking)
                    // Wait, service_history table might need adjustment for products, but I'll skip for now if not requested.
                }

                return true;
            } catch (e) {
                console.error('Error purchasing product:', e);
                return false;
            }
        },
        updateReservationStatus: async (_: any, { id, status, paymentMode }: any, { session }: any) => {
            try {
                // Fetch current status and service details before update
                const currentRes = await query(`
                    SELECT r.status, s.price, r.user_id 
                    FROM reservations r 
                    JOIN services s ON r.service_id = s.id 
                    WHERE r.id = $1
                `, [id]);

                const oldStatus = currentRes.rows[0]?.status;
                const servicePrice = parseFloat(currentRes.rows[0]?.price || 0);
                const userId = currentRes.rows[0]?.user_id;

                let queryText = 'UPDATE reservations SET status = $1';
                const values = [status, id];
                if (paymentMode) {
                    queryText += ', payment_mode = $3';
                    values.push(paymentMode);
                }
                queryText += ' WHERE id = $2 RETURNING id, status, payment_mode as "paymentMode"';

                await query(queryText, values);

                // Add points if status changed to 'confirmed' (consumed)
                if (status === 'confirmed' && oldStatus !== 'confirmed' && userId) {
                    const pointsToAdd = Math.floor(servicePrice / 10);
                    if (pointsToAdd > 0) {
                        await query('UPDATE users SET points = points + $1 WHERE id = $2', [pointsToAdd, userId]);
                    }

                    // Referral Logic: Check if this is the user's first confirmed reservation
                    const prevConfirmedRes = await query(
                        "SELECT id FROM reservations WHERE user_id = $1 AND status = 'confirmed' AND id != $2",
                        [userId, id]
                    );

                    if (prevConfirmedRes.rows.length === 0) {
                        // First one! Check if they were referred
                        const userRes = await query('SELECT referred_by_id FROM users WHERE id = $1', [userId]);
                        const referrerId = userRes.rows[0]?.referred_by_id;

                        if (referrerId) {
                            // Give 10 points to the referrer
                            await query('UPDATE users SET points = points + 10 WHERE id = $1', [referrerId]);
                        }
                    }
                }

                const fullRes = await query(`
                    SELECT 
                        r.id, r.date, r.status, r.payment_mode as "paymentMode", r.external_title as "externalTitle", r.google_event_id,
                        json_build_object('id', u.id, 'name', u.name, 'email', u.email) as user,
                        json_build_object('id', s.id, 'name', s.name, 'price', s.price, 'image', s.image, 'duration', s.duration) as service,
                        json_build_object('id', p.id, 'name', p.name, 'role', p.role, 'image', p.image, 'rating', p.rating, 'specialty', p.specialty, 'calendar_color_id', p.calendar_color_id) as prestataire
                    FROM reservations r
                    LEFT JOIN users u ON r.user_id = u.id
                    LEFT JOIN services s ON r.service_id = s.id
                    LEFT JOIN specialistes p ON r.prestataire_id = p.id
                    WHERE r.id = $1
                `, [id]);

                const result = {
                    ...fullRes.rows[0],
                    date: fullRes.rows[0].date ? new Date(fullRes.rows[0].date).toISOString() : null
                };

                // Push to Google Calendar if status is confirmed
                if (status === 'confirmed' && session?.user?.email) {
                    try {
                        const auth = await getAuthorizedGoogleClient(session.user.email);
                        if (auth) {
                            const eventId = await createGoogleCalendarEvent(auth, result);
                            if (eventId) {
                                await query('UPDATE reservations SET google_event_id = $1 WHERE id = $2', [eventId, id]);
                            }
                        }
                    } catch (ge) {
                        console.error('Google Calendar Push Error:', ge);
                    }
                }

                return result;
            } catch (e) {
                console.error(e);
                throw new Error("Failed to update reservation status");
            }
        },
        syncGoogleCalendar: async (_: any, __: any, { session }: any) => {
            if (!session?.user?.email) return false;
            try {
                const auth = await getAuthorizedGoogleClient(session.user.email);
                if (!auth) {
                    console.log("No authorized Google client found for", session.user.email);
                    return false;
                }

                // Fetch events from 7 days ago to 7 days in the future
                const timeMin = new Date();
                timeMin.setDate(timeMin.getDate() - 7);

                const events = await listGoogleCalendarEvents(auth, timeMin.toISOString());
                console.log(`Found ${events.length} events in Google Calendar`);
                for (const event of events) {
                    const eventId = event.id;
                    const title = event.summary || 'Sans titre';
                    const startDate = event.start?.dateTime || event.start?.date;
                    const endDate = event.end?.dateTime || event.end?.date;

                    if (!startDate) continue;

                    await query(`
                        INSERT INTO external_events (google_event_id, title, start_date, end_date)
                        VALUES ($1, $2, $3, $4)
                        ON CONFLICT (google_event_id) DO UPDATE SET
                            title = EXCLUDED.title,
                            start_date = EXCLUDED.start_date,
                            end_date = EXCLUDED.end_date
                    `, [eventId, title, startDate, endDate]);
                }
                return true;
            } catch (e) {
                console.error('Sync Error:', e);
                return false;
            }
        },
        updateReservationDate: async (_: any, { id, date }: any) => {
            try {
                await query('UPDATE reservations SET date = $1 WHERE id = $2', [date, id]);
                const fullRes = await query(`
                    SELECT 
                        r.id, r.date, r.status, r.external_title as "externalTitle", r.google_event_id, r.payment_mode as "paymentMode",
                        json_build_object('id', u.id, 'name', u.name, 'email', u.email) as user,
                        json_build_object('id', s.id, 'name', s.name, 'price', s.price, 'image', s.image, 'duration', s.duration) as service,
                        json_build_object('id', p.id, 'name', p.name, 'role', p.role, 'image', p.image, 'rating', p.rating, 'specialty', p.specialty, 'calendar_color_id', p.calendar_color_id) as prestataire
                    FROM reservations r
                    LEFT JOIN users u ON r.user_id = u.id
                    LEFT JOIN services s ON r.service_id = s.id
                    LEFT JOIN specialistes p ON r.prestataire_id = p.id
                    WHERE r.id = $1
                `, [id]);
                return {
                    ...fullRes.rows[0],
                    date: fullRes.rows[0].date ? new Date(fullRes.rows[0].date).toISOString() : null
                };
            } catch (e) {
                console.error(e);
                throw new Error("Failed to update reservation date");
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
        },
        convertExternalToReservation: async (_: any, { externalId, userId, serviceId, prestataireId }: any) => {
            try {
                // Get event details
                const eventRes = await query('SELECT title, start_date FROM external_events WHERE id = $1', [externalId]);
                const event = eventRes.rows[0];
                if (!event) throw new Error('External event not found');

                // Create reservation
                const res = await query(
                    'INSERT INTO reservations (user_id, service_id, prestataire_id, date, status, external_title) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                    [userId, serviceId, prestataireId, event.start_date, 'confirmed', event.title]
                );
                const reservationId = res.rows[0].id;

                // Update external event link
                await query('UPDATE external_events SET reservation_id = $1 WHERE id = $2', [reservationId, externalId]);

                // Return full reservation
                const fullRes = await query(`
                    SELECT 
                        r.id, r.date, r.status, r.external_title as "externalTitle", r.google_event_id, r.payment_mode as "paymentMode", r.drink_choice, r.genre,
                        json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'drink_pref', u.drink_pref) as user,
                        json_build_object('id', s.id, 'name', s.name, 'price', s.price, 'image', s.image, 'duration', s.duration) as service,
                        json_build_object('id', p.id, 'name', p.name, 'role', p.role, 'image', p.image, 'rating', p.rating, 'specialty', p.specialty, 'calendar_color_id', p.calendar_color_id) as prestataire
                    FROM reservations r
                    LEFT JOIN users u ON r.user_id = u.id
                    LEFT JOIN services s ON r.service_id = s.id
                    LEFT JOIN specialistes p ON r.prestataire_id = p.id
                    WHERE r.id = $1
                `, [reservationId]);

                return {
                    ...fullRes.rows[0],
                    date: fullRes.rows[0].date ? new Date(fullRes.rows[0].date).toISOString() : null
                };
            } catch (e) {
                console.error('Error converting event:', e);
                throw e;
            }
        },
        addDrink: async (_: any, { name, image }: any) => {
            try {
                const res = await query('INSERT INTO drinks (name, image) VALUES ($1, $2) RETURNING *', [name, image]);
                return res.rows[0];
            } catch (e) {
                console.error('Error adding drink:', e);
                throw e;
            }
        },
        removeDrink: async (_: any, { id }: any) => {
            try {
                await query('DELETE FROM drinks WHERE id = $1', [id]);
                return true;
            } catch (e) {
                console.error('Error removing drink:', e);
                return false;
            }
        },
        updateReservationDrink: async (_: any, { id, drinkChoice }: any) => {
            try {
                const res = await query('UPDATE reservations SET drink_choice = $1 WHERE id = $2 RETURNING *', [drinkChoice, id]);
                const row = res.rows[0];
                if (!row) throw new Error('Reservation not found');
                return row;
            } catch (e) {
                console.error('Error updating reservation drink:', e);
                throw e;
            }
        },
    },
};
