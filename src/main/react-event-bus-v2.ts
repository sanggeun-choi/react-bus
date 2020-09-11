import { useEffect, useMemo } from 'react';

const context = { subId: 0 };

class EventBus {
    public subscribers: Object;

    constructor() {
        this.subscribers = {};
    }

    public dispatch(...props): void {
        Object.values(this.subscribers).forEach((subscriber) => subscriber.callback(...props));
    }
}

export function createEventBus(): EventBus {
    return new EventBus();
}

export function useEventBusSelector(eventBus: EventBus, callback: Function): void {
    const subId = useMemo(() => `sub-${context.subId++}`, []);

    useEffect(() => {
        eventBus.subscribers[subId] = { callback };

        return () => delete eventBus.subscribers[subId];
    }, [eventBus, subId, callback]);
}
