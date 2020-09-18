export const context = { subId: 0 };

export class Bus {
    protected subscribers: any;

    constructor() {
        this.subscribers = {};
    }

    public getSubscribers(): any {
        return this.subscribers;
    }

    public subscribe(subId: string, callback: Function): void {
        this.subscribers[subId] = { callback };
    }

    public unsubscribe(subId: string): void {
        delete this.subscribers[subId];
    }
}
