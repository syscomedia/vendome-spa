import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ count: 0 });
    try {
        const res = await query(
            'SELECT COUNT(*) as cnt FROM chat_messages WHERE receiver_id = $1 AND is_read = FALSE',
            [userId]
        );
        return NextResponse.json({ count: parseInt(res.rows[0].cnt) });
    } catch {
        return NextResponse.json({ count: 0 });
    }
}
