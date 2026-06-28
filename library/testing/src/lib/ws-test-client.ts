import { io, Socket } from 'socket.io-client';

export interface WsTestClientConnectOptions {
    url: string;
    namespace: string;
    token: string;
}

/** Thin socket.io-client wrapper for e2e specs asserting on real gateway connections and emitted events. */
export class WsTestClient {
    private socket?: Socket;

    connect(options: WsTestClientConnectOptions): Promise<void> {
        const socket = io(`${options.url}${options.namespace}`, { auth: { token: options.token }, transports: ['websocket'], forceNew: true });
        this.socket = socket;
        return new Promise<void>((resolve, reject) => {
            socket.once('connect', () => resolve());
            socket.once('connect_error', (error) => reject(error));
        });
    }

    /** Sends `payload` only when provided - NestJS's WS dispatch reads just the first emitted argument, so an explicit `undefined` second arg would push the ack callback out of position and it would never resolve. */
    emitWithAck<T = unknown>(event: string, payload?: unknown, timeoutMs = 5000): Promise<T> {
        if (!this.socket) throw new Error('WsTestClient is not connected');
        const socket = this.socket.timeout(timeoutMs);
        return payload === undefined ? socket.emitWithAck(event) : socket.emitWithAck(event, payload);
    }

    waitForEvent<T = unknown>(event: string, timeoutMs = 5000): Promise<T> {
        if (!this.socket) throw new Error('WsTestClient is not connected');
        const socket = this.socket;
        return new Promise<T>((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error(`Timed out waiting for "${event}"`)), timeoutMs);
            socket.once(event, (payload: T) => {
                clearTimeout(timer);
                resolve(payload);
            });
        });
    }

    disconnect(): void {
        this.socket?.disconnect();
        this.socket = undefined;
    }
}
