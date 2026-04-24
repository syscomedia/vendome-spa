import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ count: 0 });
    try {
        const userRes = await query('SELECT role FROM users WHERE id = $1', [userId]);
        const role = userRes.rows[0]?.role;

        let sql = "SELECT COUNT(*) as cnt FROM chat_messages WHERE receiver_id = $1 AND is_read = FALSE";
        let params = [userId];

        if (role === 'admin') {
            sql = "SELECT COUNT(*) as cnt FROM chat_messages WHERE receiver_id IN (SELECT id FROM users WHERE role = 'admin') AND is_read = FALSE";
            params = [];
        }

        const res = await query(sql, params);
        return NextResponse.json({ count: parseInt(res.rows[0].cnt) });
    } catch {
        return NextResponse.json({ count: 0 });
    }
}
