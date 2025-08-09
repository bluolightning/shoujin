export interface EventPayloadMap {
    tabActivated: {activeInfo: {tabId: number}};
    tabRemoved: {tabId: number};
    urlUpdated: {tabId: number};
}

export type QueueEvent = {
    [K in keyof EventPayloadMap]: {
        type: K;
        payload: EventPayloadMap[K];
    };
}[keyof EventPayloadMap];

type EventHandler = (event: QueueEvent) => Promise<void>;

export class QueueProcessor {
    private queue: QueueEvent[] = [];
    private isProcessing = false;
    private eventHandler: EventHandler;

    constructor(handler: EventHandler) {
        if (!handler || typeof handler !== 'function') {
            throw new Error('QueueProcessor requires a valid event handler function.');
        }
        this.eventHandler = handler;
    }

    // Adds an event to the queue and starts processing if not already active.
    public enqueue<K extends keyof EventPayloadMap>(type: K, payload: EventPayloadMap[K]): void {
        console.log(`[Queue] Enqueuing event: ${type}`);
        const event = {type, payload} as QueueEvent;
        this.queue.push(event);
        // Use Promise.resolve().then() to avoid deep call stacks on a busy queue
        Promise.resolve().then(() => this.processNext());
    }

    // Processes the next event in the queue if the queue is not locked.
    private async processNext(): Promise<void> {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const event = this.queue.shift();

        if (!event) {
            this.isProcessing = false;
            return;
        }

        try {
            console.log(`[Queue] Processing event: ${event.type}`, event.payload);
            await this.eventHandler(event);
        } catch (error) {
            console.error(`[Queue] Error processing event ${event.type}:`, error);
        } finally {
            this.isProcessing = false;
            this.processNext();
        }
    }
}
