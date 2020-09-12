import { useEffect, useMemo } from 'react';
import { Bus, context } from './react-bus-core';

class EventBus extends Bus {
    public dispatch(...props): void {
        Object.values(this.subscribers).forEach((subscriber: any) => subscriber.callback(...props));
    }
}

export function createEventBus(): EventBus {
    return new EventBus();
}

export function useEventBusSelector(eventBus: EventBus, callback: Function): void {
    const subId = useMemo(() => `sub-${context.subId++}`, []);

    useEffect(() => {
        eventBus.subscribe(subId, callback);

        return () => eventBus.unsubscribe(subId);
    }, [eventBus, subId, callback]);
}
