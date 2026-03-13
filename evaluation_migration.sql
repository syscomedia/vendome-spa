CREATE TABLE IF NOT EXISTS personnel_evaluations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    prestataire_id INTEGER REFERENCES prestataires(id),
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
