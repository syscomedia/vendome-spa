import { NextRequest } from 'next/server';
import { query } from '@/lib/db';

// Global map of SSE clients: userId → set of response controllers
const clients = new Map<string, Set<ReadableStreamDefaultController>>();

export function addClient(userId: string, controller: ReadableStreamDefaultController) {
    if (!clients.has(userId)) clients.set(userId, new Set());
    clients.get(userId)!.add(controller);
}

export function removeClient(userId: string, controller: ReadableStreamDefaultController) {
    clients.get(userId)?.delete(controller);
    if (clients.get(userId)?.size === 0) clients.delete(userId);
}

export function broadcastToUser(userId: string, data: object) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    clients.get(userId)?.forEach(ctrl => {
        try { ctrl.enqueue(new TextEncoder().encode(payload)); } catch { /* closed */ }
    });
}

// Broadcast to all admin connections
export function broadcastToAdmins(data: object) {
    // Admin user IDs are tracked with prefix "admin:"
    clients.forEach((controllers, key) => {
        if (key.startsWith('admin:')) {
            const payload = `data: ${JSON.stringify(data)}\n\n`;
            controllers.forEach(ctrl => {
                try { ctrl.enqueue(new TextEncoder().encode(payload)); } catch { /* closed */ }
            });
        }
    });
}

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId');
    const role = req.nextUrl.searchParams.get('role');

    if (!userId) {
        return new Response('Missing userId', { status: 400 });
    }

    const clientKey = role === 'admin' ? `admin:${userId}` : userId;

    let controller: ReadableStreamDefaultController;

    const stream = new ReadableStream({
        start(ctrl) {
            controller = ctrl;
            addClient(clientKey, controller);

            // Send initial ping
            const ping = `data: ${JSON.stringify({ type: 'connected', userId })}\n\n`;
            ctrl.enqueue(new TextEncoder().encode(ping));
        },
        cancel() {
            removeClient(clientKey, controller);
        },
    });

    // Keepalive every 25s to prevent proxy timeouts
    const keepalive = setInterval(() => {
        try {
            const ping = `: keepalive\n\n`;
            controller?.enqueue(new TextEncoder().encode(ping));
        } catch {
            clearInterval(keepalive);
            removeClient(clientKey, controller);
        }
    }, 25000);

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
