-- Add columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Create Reservations
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    service_id INTEGER REFERENCES services(id),
    prestataire_id INTEGER REFERENCES prestataires(id),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Products
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Products
INSERT INTO products (name, description, price, image) VALUES 
('Luxury Face Cream', 'Rejuvenating cream for all skin types', 85.00, 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=1000&auto=format&fit=crop'),
('Aroma Oil Set', 'Set of 5 essential oils for relaxation', 45.00, 'https://images.unsplash.com/photo-1608571423902-eed4a5e84d85?q=80&w=1000&auto=format&fit=crop'),
('Bath Salts', 'Organic dead sea salts', 30.00, 'https://images.unsplash.com/photo-1612817288484-96916a0676bc?q=80&w=1000&auto=format&fit=crop')
ON CONFLICT DO NOTHING;

-- Create Comments for 'Maintenant'
CREATE TABLE IF NOT EXISTS waiting_comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tips
CREATE TABLE IF NOT EXISTS tips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    prestataire_id INTEGER REFERENCES prestataires(id),
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
