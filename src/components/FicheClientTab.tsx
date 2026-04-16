'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, Loader2, UserCheck, Scissors, Palette, Music2,
    Coffee, Wine, Heart, Sparkles, Phone, Calendar,
    AlertTriangle, FileText, Star, Check, ChevronRight,
    Droplets, Camera, Link2, Play
} from 'lucide-react';
import Swal from 'sweetalert2';
import DayMonthPicker from './DayMonthPicker';

interface FicheClientTabProps {
    client: any;
    prestataires: any[];
    services: any[];
    updateUser: (opts: any) => Promise<any>;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: any) => Promise<void>;
    isUploading: boolean;
    t: (key: any) => string;
    styles: any;
}

const HAIR_COLORS = [
    { label: 'Blond polaire',  hex: '#F5ECD7' },
    { label: 'Blond doré',    hex: '#E2B45C' },
    { label: 'Châtain clair', hex: '#C49A6C' },
    { label: 'Châtain doré',  hex: '#A0724A' },
    { label: 'Brun naturel',  hex: '#6B3D2E' },
    { label: 'Noir',          hex: '#1A0F0A' },
    { label: 'Rouge auburn',  hex: '#8B2500' },
    { label: 'Rose',          hex: '#E91E8C' },
    { label: 'Gris argenté',  hex: '#9E9E9E' },
    { label: 'Ombré',         hex: 'linear-gradient(180deg,#F5ECD7,#6B3D2E)' },
];

const SKIN_TYPES = [
    { label: 'Normale',   icon: '✨' },
    { label: 'Sèche',     icon: '🌵' },
    { label: 'Grasse',    icon: '💧' },
    { label: 'Mixte',     icon: '☯️' },
    { label: 'Sensible',  icon: '🌸' },
    { label: 'Mature',    icon: '🌿' },
];

const NAIL_COLORS = [
    '#FAD4D4','#F08080','#C0392B','#922B21',
    '#F4A460','#E67E22','#F9E79F','#F1C40F',
    '#A9DFBF','#27AE60','#AED6F1','#2980B9',
    '#D2B4DE','#8E44AD','#1C2833','#FFFFFF',
    '#F2F3F4','#D5DBDB',
];

const NAIL_FINISHES = ['Brillant', 'Mat', 'Nacré', 'Gel', 'Semi-permanent', 'Press-on'];

const MUSIC_OPTIONS = [
    { label: 'Jazz',              emoji: '🎷' },
    { label: 'Lounge',            emoji: '🎵' },
    { label: 'Classique',         emoji: '🎻' },
    { label: 'Nature & Spa',      emoji: '🌿' },
    { label: 'Pop douce',         emoji: '🎶' },
    { label: 'Bossa Nova',        emoji: '🎸' },
    { label: 'Silence',           emoji: '🤫' },
    { label: 'Ambiance orientale',emoji: '🪘' },
];

const DRINK_OPTIONS = [
    { label: 'Eau infusée menthe', emoji: '🌱' },
    { label: 'Thé vert bio',       emoji: '🍵' },
    { label: 'Tisane lavande',     emoji: '💜' },
    { label: 'Eau pétillante',     emoji: '💧' },
    { label: 'Jus de gingembre',   emoji: '🫚' },
    { label: 'Café',               emoji: '☕' },
    { label: 'Cappuccino',         emoji: '🧋' },
    { label: "Lait d'amande",      emoji: '🥛' },
    { label: 'Kombucha',           emoji: '🫙' },
];

const TIER_COLORS: Record<string, string> = {
    Normal: '#9E9E9E', Silver: '#90CAF9', Gold: '#E2B45C',
    Platinum: '#B2EBF2', Diamond: '#CE93D8',
};

export default function FicheClientTab({
    client, prestataires, services, updateUser,
    handleFileUpload, isUploading, t, styles
}: FicheClientTabProps) {
    const [fiche, setFiche] = useState<any>({ ...client });
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('beaute');
    const [saved, setSaved] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const update = (field: string, value: string) =>
        setFiche((prev: any) => ({ ...prev, [field]: value }));

    const toggle = (field: string, value: string) =>
        setFiche((prev: any) => ({ ...prev, [field]: prev[field] === value ? '' : value }));

    const save = async () => {
        setSaving(true);
        try {
            await updateUser({
                variables: {
                    userId: fiche.id,
                    hair_color_pref: fiche.hair_color_pref,
                    favorite_coupe: fiche.favorite_coupe,
                    nail_color_pref: fiche.nail_color_pref,
                    skin_type: fiche.skin_type,
                    music_pref: fiche.music_pref,
                    music_link: fiche.music_link,
                    drink_pref: fiche.drink_pref,
                    coffee_pref: fiche.coffee_pref,
                    employee_pref: fiche.employee_pref,
                    favourite_service: fiche.favourite_service,
                    allergies: fiche.allergies,
                    last_visit_notes: fiche.last_visit_notes,
                    birthday: fiche.birthday,
                    phone: fiche.phone,
                    image: fiche.image,
                }
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            Swal.fire({
                title: 'Fiche sauvegardée !',
                html: '<p style="color:#7a6a5a;font-size:0.95rem">Vos préférences ont été enregistrées avec succès.</p>',
                icon: 'success',
                confirmButtonColor: '#1A0F0A',
                background: '#FFFDF9',
                color: '#1A0F0A',
            });
        } catch {
            Swal.fire({ title: 'Erreur', text: 'Une erreur est survenue.', icon: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const tierColor = TIER_COLORS[fiche.tier] || TIER_COLORS.Normal;
    const completionFields = [
        fiche.hair_color_pref, fiche.favorite_coupe, fiche.nail_color_pref,
        fiche.skin_type, fiche.music_pref, fiche.drink_pref,
        fiche.employee_pref, fiche.favourite_service, fiche.phone, fiche.birthday,
    ];
    const completionPct = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

    const sections = [
        { id: 'beaute',      label: 'Beauté',       icon: <Sparkles size={15} /> },
        { id: 'preferences', label: 'Bien-être',    icon: <Heart size={15} /> },
        { id: 'infos',       label: 'Mon Profil',   icon: <FileText size={15} /> },
    ];

    return (
        <div className={styles.ficheTabWrapper}>

            {/* ── HERO IDENTITY CARD ── */}
            <div className={styles.ficheHero}>
                {/* Background decorative orb */}
                <div className={styles.ficheHeroBg} />

                <div className={styles.ficheHeroInner}>
                    {/* Avatar */}
                    <div className={styles.ficheAvatarWrap} onClick={() => fileRef.current?.click()}>
                        <div className={styles.ficheAvatarRing} style={{ '--tier-color': tierColor } as any} />
                        <div className={styles.ficheAvatarImg}>
                            {fiche.image
                                ? <img src={fiche.image} alt={fiche.name} />
                                : <span className={styles.ficheAvatarInitial}>{fiche.name?.[0]?.toUpperCase() || '?'}</span>
                            }
                            {isUploading && (
                                <div className={styles.ficheAvatarLoader}>
                                    <Loader2 size={22} className="animate-spin" />
                                </div>
                            )}
                        </div>
                        <div className={styles.ficheAvatarCam}><Camera size={13} /></div>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                if (file.size > 2 * 1024 * 1024) {
                                    Swal.fire({ title: 'Fichier trop volumineux', text: 'Veuillez choisir une image de moins de 2 Mo.', icon: 'warning', confirmButtonColor: '#DFB96D' });
                                    return;
                                }

                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    const base64String = reader.result as string;
                                    setFiche((prev: any) => ({ ...prev, image: base64String }));
                                };
                                reader.readAsDataURL(file);
                            }} />
                    </div>

                    {/* Identity */}
                    <div className={styles.ficheIdentity}>
                        <div className={styles.ficheTierPill} style={{ background: `${tierColor}22`, color: tierColor, borderColor: `${tierColor}44` }}>
                            <Star size={10} fill={tierColor} />
                            <span>{fiche.tier || 'Member'}</span>
                        </div>
                        <h2 className={styles.ficheHeroName}>{fiche.name}</h2>
                        <p className={styles.ficheHeroEmail}>{fiche.email}</p>

                        <div className={styles.ficheHeroStats}>
                            <div className={styles.ficheStat}>
                                <span className={styles.ficheStatVal}>{fiche.points || 0}</span>
                                <span className={styles.ficheStatLabel}>Points</span>
                            </div>
                            <div className={styles.ficheStatDivider} />
                            <div className={styles.ficheStat}>
                                <span className={styles.ficheStatVal}>{completionPct}%</span>
                                <span className={styles.ficheStatLabel}>Complété</span>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Completion bar */}
                <div className={styles.ficheCompletion}>
                    <div className={styles.ficheCompletionTrack}>
                        <motion.div
                            className={styles.ficheCompletionFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${completionPct}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                    </div>
                    <span className={styles.ficheCompletionLabel}>Profil {completionPct}% complété</span>
                </div>
            </div>

            {/* ── SECTION TABS ── */}
            <div className={styles.ficheTabs}>
                {sections.map(s => (
                    <button
                        key={s.id}
                        className={`${styles.ficheTab} ${activeSection === s.id ? styles.ficheTabActive : ''}`}
                        onClick={() => setActiveSection(s.id)}
                    >
                        {s.icon}
                        <span>{s.label}</span>
                        {activeSection === s.id && (
                            <motion.div layoutId="ficheTabUnderline" className={styles.ficheTabLine} />
                        )}
                    </button>
                ))}
            </div>

            {/* ── SECTIONS ── */}
            <AnimatePresence mode="wait">

                {/* BEAUTÉ */}
                {activeSection === 'beaute' && (
                    <motion.div key="beaute"
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
                        className={styles.ficheSections}
                    >
                        {/* Hair */}
                        <div className={styles.ficheCard}>
                            <div className={styles.ficheCardHead}>
                                <div className={styles.ficheCardIcon}><Palette size={16} /></div>
                                <div>
                                    <h3 className={styles.ficheCardTitle}>Couleur de cheveux</h3>
                                    <p className={styles.ficheCardSub}>Votre teinte préférée</p>
                                </div>
                                {fiche.hair_color_pref && <div className={styles.ficheDoneTag}><Check size={11} /> Choisi</div>}
                            </div>
                            <div className={styles.ficheHairSwatches}>
                                {HAIR_COLORS.map(c => (
                                    <button key={c.label}
                                        title={c.label}
                                        className={`${styles.ficheHairSwatch} ${fiche.hair_color_pref === c.label ? styles.ficheHairSwatchActive : ''}`}
                                        onClick={() => toggle('hair_color_pref', c.label)}
                                    >
                                        <span className={styles.ficheHairDot}
                                            style={{ background: c.hex.startsWith('linear') ? c.hex : c.hex }} />
                                        <span className={styles.ficheHairLabel}>{c.label}</span>
                                        {fiche.hair_color_pref === c.label && (
                                            <span className={styles.ficheHairCheck}><Check size={10} /></span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <input className={styles.ficheInput} placeholder="Couleur personnalisée..."
                                value={!HAIR_COLORS.map(c=>c.label).includes(fiche.hair_color_pref||'') ? (fiche.hair_color_pref||'') : ''}
                                onChange={e => update('hair_color_pref', e.target.value)} />
                        </div>

                        {/* Coupe */}
                        <div className={styles.ficheCard}>
                            <div className={styles.ficheCardHead}>
                                <div className={styles.ficheCardIcon}><Scissors size={16} /></div>
                                <div>
                                    <h3 className={styles.ficheCardTitle}>Coupe favorite</h3>
                                    <p className={styles.ficheCardSub}>Style capillaire préféré</p>
                                </div>
                                {fiche.favorite_coupe && <div className={styles.ficheDoneTag}><Check size={11} /> Noté</div>}
                            </div>
                            <input className={styles.ficheInput}
                                placeholder="Ex: Carré plongeant, Balayage, Dégradé..."
                                value={fiche.favorite_coupe || ''}
                                onChange={e => update('favorite_coupe', e.target.value)} />
                        </div>

                        {/* Nails */}
                        <div className={styles.ficheCard}>
                            <div className={styles.ficheCardHead}>
                                <div className={styles.ficheCardIcon}><Sparkles size={16} /></div>
                                <div>
                                    <h3 className={styles.ficheCardTitle}>Faux ongles</h3>
                                    <p className={styles.ficheCardSub}>Couleur & finition préférées</p>
                                </div>
                                {fiche.nail_color_pref && <div className={styles.ficheDoneTag}><Check size={11} /> Choisi</div>}
                            </div>
                            <div className={styles.ficheNailGrid}>
                                {NAIL_COLORS.map(c => (
                                    <button key={c}
                                        className={`${styles.ficheNailBtn} ${fiche.nail_color_pref === c ? styles.ficheNailBtnActive : ''}`}
                                        style={{ background: c }}
                                        title={c}
                                        onClick={() => toggle('nail_color_pref', c)}
                                    >
                                        {fiche.nail_color_pref === c && <Check size={12} color={c === '#FFFFFF' || c === '#F2F3F4' ? '#1A0F0A' : 'white'} />}
                                    </button>
                                ))}
                            </div>
                            <div className={styles.ficheNailFinishes}>
                                {NAIL_FINISHES.map(f => (
                                    <button key={f}
                                        className={`${styles.fichePill} ${fiche.nail_color_pref?.includes(f) ? styles.fichePillActive : ''}`}
                                        onClick={() => update('nail_color_pref', f)}
                                    >{f}</button>
                                ))}
                            </div>
                            <input className={styles.ficheInput} placeholder="Couleur ou finition personnalisée..."
                                value={!NAIL_COLORS.includes(fiche.nail_color_pref||'') && !NAIL_FINISHES.includes(fiche.nail_color_pref||'') ? (fiche.nail_color_pref||'') : ''}
                                onChange={e => update('nail_color_pref', e.target.value)} />
                        </div>

                        {/* Skin type */}
                        <div className={styles.ficheCard}>
                            <div className={styles.ficheCardHead}>
                                <div className={styles.ficheCardIcon}><Droplets size={16} /></div>
                                <div>
                                    <h3 className={styles.ficheCardTitle}>Type de peau</h3>
                                    <p className={styles.ficheCardSub}>Pour adapter les soins</p>
                                </div>
                                {fiche.skin_type && <div className={styles.ficheDoneTag}><Check size={11} /> Choisi</div>}
                            </div>
                            <div className={styles.ficheSkinGrid}>
                                {SKIN_TYPES.map(s => (
                                    <button key={s.label}
                                        className={`${styles.ficheSkinCard} ${fiche.skin_type === s.label ? styles.ficheSkinCardActive : ''}`}
                                        onClick={() => toggle('skin_type', s.label)}
                                    >
                                        <span className={styles.ficheSkinEmoji}>{s.icon}</span>
                                        <span className={styles.ficheSkinLabel}>{s.label}</span>
                                        {fiche.skin_type === s.label && <div className={styles.ficheSkinCheck}><Check size={10} /></div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Allergies */}
                        <div className={styles.ficheCard}>
                            <div className={styles.ficheCardHead}>
                                <div className={styles.ficheCardIcon} style={{ background: 'rgba(239,68,68,0.12)', color: '#dc2626' }}>
                                    <AlertTriangle size={16} />
                                </div>
                                <div>
                                    <h3 className={styles.ficheCardTitle}>Allergies & Contre-indications</h3>
                                    <p className={styles.ficheCardSub}>Informations médicales importantes</p>
                                </div>
                            </div>
                            <textarea className={styles.ficheTextarea} rows={3}
                                placeholder="Ex: Allergie aux huiles essentielles, latex, produits parfumés..."
                                value={fiche.allergies || ''}
                                onChange={e => update('allergies', e.target.value)} />
                        </div>
                    </motion.div>
                )}

                {/* BIEN-ÊTRE */}
                {activeSection === 'preferences' && (
                    <motion.div key="preferences"
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
                        className={styles.ficheSections}
                    >
                        {/* Music */}
                        <div className={styles.ficheCard}>
                            <div className={styles.ficheCardHead}>
                                <div className={styles.ficheCardIcon}><Music2 size={16} /></div>
                                <div>
                                    <h3 className={styles.ficheCardTitle}>Ambiance musicale</h3>
                                    <p className={styles.ficheCardSub}>Durant vos soins</p>
                                </div>
                                {fiche.music_pref && <div className={styles.ficheDoneTag}><Check size={11} /> Choisi</div>}
                            </div>
                            <div className={styles.ficheMusicGrid}>
                                {MUSIC_OPTIONS.map(m => (
                                    <button key={m.label}
                                        className={`${styles.ficheMusicCard} ${fiche.music_pref === m.label ? styles.ficheMusicCardActive : ''}`}
                                        onClick={() => toggle('music_pref', m.label)}
                                    >
                                        <span className={styles.ficheMusicEmoji}>{m.emoji}</span>
                                        <span className={styles.ficheMusicLabel}>{m.label}</span>
                                        {fiche.music_pref === m.label && <div className={styles.ficheMusicCheck}><Check size={10} /></div>}
                                    </button>
                                ))}
                            </div>

                            {/* Music link input */}
                            <div className={styles.ficheMusicLinkRow}>
                                <Link2 size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                <input
                                    className={styles.ficheInputInline}
                                    placeholder="Lien Spotify / YouTube / Apple Music..."
                                    value={fiche.music_link || ''}
                                    onChange={e => update('music_link', e.target.value)}
                                />
                                {fiche.music_link && (
                                    <a
                                        href={fiche.music_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.ficheMusicPlayBtn}
                                        title="Ouvrir le lien"
                                    >
                                        <Play size={13} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Drinks */}
                        <div className={styles.ficheCard}>
                            <div className={styles.ficheCardHead}>
                                <div className={styles.ficheCardIcon}><Wine size={16} /></div>
                                <div>
                                    <h3 className={styles.ficheCardTitle}>Boisson favorite</h3>
                                    <p className={styles.ficheCardSub}>À vous offrir à l'arrivée</p>
                                </div>
                                {fiche.drink_pref && <div className={styles.ficheDoneTag}><Check size={11} /> Choisi</div>}
                            </div>
                            <div className={styles.ficheDrinkGrid}>
                                {DRINK_OPTIONS.map(d => (
                                    <button key={d.label}
                                        className={`${styles.ficheDrinkCard} ${fiche.drink_pref === d.label ? styles.ficheDrinkCardActive : ''}`}
                                        onClick={() => toggle('drink_pref', d.label)}
                                    >
                                        <span className={styles.ficheDrinkEmoji}>{d.emoji}</span>
                                        <span>{d.label}</span>
                                        {fiche.drink_pref === d.label && <Check size={12} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                                    </button>
                                ))}
                            </div>
                            <div className={styles.ficheCoffeeRow}>
                                <Coffee size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                <input className={styles.ficheInputInline}
                                    placeholder="Café préféré (Espresso, Cappuccino...)"
                                    value={fiche.coffee_pref || ''}
                                    onChange={e => update('coffee_pref', e.target.value)} />
                            </div>
                        </div>

                        {/* Favourite service */}
                        <div className={styles.ficheCard}>
                            <div className={styles.ficheCardHead}>
                                <div className={styles.ficheCardIcon}><Star size={16} /></div>
                                <div>
                                    <h3 className={styles.ficheCardTitle}>Service favori</h3>
                                    <p className={styles.ficheCardSub}>Votre soin préféré</p>
                                </div>
                                {fiche.favourite_service && <div className={styles.ficheDoneTag}><Check size={11} /> Choisi</div>}
                            </div>
                            <div className={styles.ficheServiceGrid}>
                                {services.filter((s: any) => s.enabled !== false).map((s: any) => (
                                    <button key={s.id}
                                        className={`${styles.ficheServiceCard} ${fiche.favourite_service === s.name ? styles.ficheServiceCardActive : ''}`}
                                        onClick={() => toggle('favourite_service', s.name)}
                                    >
                                        {s.image && <img src={s.image} alt={s.name} className={styles.ficheServiceImg} />}
                                        <span className={styles.ficheServiceName}>{s.name}</span>
                                        {fiche.favourite_service === s.name && (
                                            <div className={styles.ficheServiceCheck}><Check size={12} /></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preferred specialist */}
                        <div className={styles.ficheCard}>
                            <div className={styles.ficheCardHead}>
                                <div className={styles.ficheCardIcon}><UserCheck size={16} /></div>
                                <div>
                                    <h3 className={styles.ficheCardTitle}>Spécialiste préféré(e)</h3>
                                    <p className={styles.ficheCardSub}>Votre expert de confiance</p>
                                </div>
                                {fiche.employee_pref && <div className={styles.ficheDoneTag}><Check size={11} /> Choisi</div>}
                            </div>
                            <div className={styles.ficheSpecGrid}>
                                {prestataires.map((p: any) => (
                                    <button key={p.id}
                                        className={`${styles.ficheSpecCard} ${fiche.employee_pref === p.name ? styles.ficheSpecCardActive : ''}`}
                                        onClick={() => toggle('employee_pref', p.name)}
                                    >
                                        <img src={p.image} alt={p.name} className={styles.ficheSpecImg} />
                                        <span className={styles.ficheSpecName}>{p.name}</span>
                                        <span className={styles.ficheSpecRole}>{p.role}</span>
                                        {fiche.employee_pref === p.name && (
                                            <div className={styles.ficheSpecCheck}><Check size={11} /></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* MON PROFIL */}
                {activeSection === 'infos' && (
                    <motion.div key="infos"
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
                        className={styles.ficheSections}
                    >
                        <div className={styles.ficheCard}>
                            <div className={styles.ficheCardHead}>
                                <div className={styles.ficheCardIcon}><Phone size={16} /></div>
                                <div>
                                    <h3 className={styles.ficheCardTitle}>Coordonnées</h3>
                                    <p className={styles.ficheCardSub}>Informations de contact</p>
                                </div>
                            </div>
                            <div className={styles.ficheInfoRow}>
                                <div className={styles.ficheInfoField}>
                                    <label className={styles.ficheInfoLabel}><Phone size={13} /> Téléphone</label>
                                    <input className={styles.ficheInput} placeholder="+216 XX XXX XXX"
                                        value={fiche.phone || ''} onChange={e => update('phone', e.target.value)} />
                                </div>
                                <div className={styles.ficheInfoField}>
                                    <label className={styles.ficheInfoLabel}><Calendar size={13} /> Date de naissance</label>
                                    <DayMonthPicker 
                                        value={fiche.birthday || ''} 
                                        onChange={(val) => update('birthday', val)} 
                                        className={styles.ficheInput}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.ficheCard}>
                            <div className={styles.ficheCardHead}>
                                <div className={styles.ficheCardIcon}><FileText size={16} /></div>
                                <div>
                                    <h3 className={styles.ficheCardTitle}>Notes & Observations</h3>
                                    <p className={styles.ficheCardSub}>Mémos de votre dernière visite</p>
                                </div>
                            </div>
                            <textarea className={styles.ficheTextarea} rows={6}
                                placeholder="Observations, préférences notées lors du dernier soin, demandes spéciales..."
                                value={fiche.last_visit_notes || ''}
                                onChange={e => update('last_visit_notes', e.target.value)} />
                        </div>

                        {/* Quick summary card */}
                        <div className={styles.ficheSummaryCard}>
                            <h4 className={styles.ficheSummaryTitle}>✨ Récapitulatif de votre profil</h4>
                            <div className={styles.ficheSummaryGrid}>
                                {[
                                    { icon: '💇', label: 'Cheveux', val: fiche.hair_color_pref },
                                    { icon: '✂️', label: 'Coupe',   val: fiche.favorite_coupe },
                                    { icon: '💅', label: 'Ongles',  val: fiche.nail_color_pref },
                                    { icon: '🎵', label: 'Musique', val: fiche.music_pref },
                                    { icon: '🍵', label: 'Boisson', val: fiche.drink_pref },
                                    { icon: '⭐', label: 'Service', val: fiche.favourite_service },
                                ].map(item => (
                                    <div key={item.label} className={styles.ficheSummaryItem}>
                                        <span className={styles.ficheSummaryEmoji}>{item.icon}</span>
                                        <div>
                                            <span className={styles.ficheSummaryLabel}>{item.label}</span>
                                            <span className={styles.ficheSummaryVal}>{item.val || '—'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── SAVE BAR ── */}
            <motion.div
                className={styles.ficheSaveBar}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className={styles.ficheSaveLeft}>
                    <div className={styles.ficheSaveProgress}>
                        <div className={styles.ficheSaveProgressFill} style={{ width: `${completionPct}%` }} />
                    </div>
                    <span>{completionPct}% complété</span>
                </div>
                <button className={`${styles.ficheSaveBtn} ${saved ? styles.ficheSaveBtnDone : ''}`}
                    onClick={save} disabled={saving}>
                    {saving
                        ? <><Loader2 size={17} className="animate-spin" /> Sauvegarde...</>
                        : saved
                            ? <><Check size={17} /> Sauvegardé !</>
                            : <><Sparkles size={17} /> Sauvegarder</>
                    }
                </button>
            </motion.div>
        </div>
    );
}
