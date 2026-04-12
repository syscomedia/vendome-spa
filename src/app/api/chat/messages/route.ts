import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { broadcastToUser, broadcastToAdmins } from '../sse/route';

// GET /api/chat/messages?userId=X&adminId=Y  → fetch conversation
// GET /api/chat/messages?inbox=1&adminId=Y   → fetch all conversations for admin
export async function GET(req: NextRequest) {
    const params = req.nextUrl.searchParams;
    const inbox = params.get('inbox');
    const adminId = params.get('adminId');
    const userId = params.get('userId');

    try {
        if (inbox && adminId) {
            // Return list of users who have chatted, with last message + unread count
            const res = await query(`
                SELECT DISTINCT ON (u.id)
                    u.id, u.name, u.email, u.image, u.tier,
                    cm.content as last_message,
                    cm.created_at as last_at,
                    cm.sender_id,
                    (
                        SELECT COUNT(*) FROM chat_messages
                        WHERE receiver_id = $1
                          AND sender_id = u.id
                          AND is_read = FALSE
                    ) as unread_count
                FROM chat_messages cm
                JOIN users u ON (
                    CASE WHEN cm.sender_id = $1 THEN cm.receiver_id ELSE cm.sender_id END = u.id
                )
                WHERE cm.sender_id = $1 OR cm.receiver_id = $1
                ORDER BY u.id, cm.created_at DESC
            `, [adminId]);
            return NextResponse.json({ conversations: res.rows });
        }

        if (userId && adminId) {
            // Fetch full conversation between user and admin
            const res = await query(`
                SELECT
                    cm.id, cm.content, cm.created_at, cm.is_read,
                    cm.sender_id,
                    u.name as sender_name, u.image as sender_image, u.role as sender_role
                FROM chat_messages cm
                JOIN users u ON cm.sender_id = u.id
                WHERE (cm.sender_id = $1 AND cm.receiver_id = $2)
                   OR (cm.sender_id = $2 AND cm.receiver_id = $1)
                ORDER BY cm.created_at ASC
            `, [userId, adminId]);

            // Mark messages from user as read (admin is reading)
            await query(`
                UPDATE chat_messages SET is_read = TRUE
                WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE
            `, [userId, adminId]);

            return NextResponse.json({ messages: res.rows });
        }

        return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
    } catch (e) {
        console.error('Chat GET error:', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST /api/chat/messages  → send a message
export async function POST(req: NextRequest) {
    try {
        const { senderId, receiverId, content } = await req.json();

        if (!senderId || !receiverId || !content?.trim()) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Get sender info
        const senderRes = await query('SELECT id, name, image, role FROM users WHERE id = $1', [senderId]);
        const sender = senderRes.rows[0];
        if (!sender) return NextResponse.json({ error: 'Sender not found' }, { status: 404 });

        // Insert message
        const res = await query(`
            INSERT INTO chat_messages (sender_id, receiver_id, content)
            VALUES ($1, $2, $3)
            RETURNING id, content, created_at, is_read, sender_id
        `, [senderId, receiverId, content.trim()]);

        const msg = {
            ...res.rows[0],
            sender_name: sender.name,
            sender_image: sender.image,
            sender_role: sender.role,
        };

        // Broadcast to receiver
        const event = { type: 'new_message', message: msg };
        broadcastToUser(String(receiverId), event);

        // If sender is client, also broadcast to all admins (for inbox badge update)
        if (sender.role !== 'admin') {
            broadcastToAdmins({ type: 'new_message', message: msg });
        } else {
            // Admin sent → notify the specific client
            broadcastToUser(String(receiverId), event);
        }

        return NextResponse.json({ message: msg });
    } catch (e) {
        console.error('Chat POST error:', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PATCH /api/chat/messages → mark messages as read
export async function PATCH(req: NextRequest) {
    try {
        const { senderId, receiverId } = await req.json();
        await query(`
            UPDATE chat_messages SET is_read = TRUE
            WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE
        `, [senderId, receiverId]);
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// GET unread count for a user
export async function HEAD(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) return new Response(null, { status: 400 });
    const res = await query(
        'SELECT COUNT(*) as cnt FROM chat_messages WHERE receiver_id = $1 AND is_read = FALSE',
        [userId]
    );
    return new Response(null, {
        headers: { 'X-Unread-Count': res.rows[0].cnt },
    });
}
