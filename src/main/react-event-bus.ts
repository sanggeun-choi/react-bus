import { useCallback, useEffect, useMemo, useRef } from 'react';
import { BUS_TYPE, context } from './react-bus-core';

function assertEventBus(eventBus) {
    if (eventBus.type !== BUS_TYPE.EVENT_BUS) {
        throw new Error(`${eventBus.type} is not invalid type -> ${BUS_TYPE.EVENT_BUS}`);
    }
}

function assertEventBusList(eventBusList) {
    eventBusList.forEach((_eventBus) => assertEventBus(_eventBus));
}

export function eventBus() {
    return {
        type: BUS_TYPE.EVENT_BUS,
        subscribers: {},
    };
}

export function useEventBus() {
    return useRef(eventBus()).current;
}

export function useEventBusCaller(...eventBusList) {
    useEffect(() => {
        assertEventBusList(eventBusList);
    }, [assertEventBusList, eventBusList]);

    return eventBusList.map((_eventBus) =>
        useCallback(
            (...params) => {
                return Object.values(_eventBus.subscribers).forEach((subscriber: any) => subscriber.callback(...params));
            },
            [_eventBus],
        ),
    );
}

export function useEventBusListener(eventBus, callback) {
    const subId = useMemo(() => `sub-${context.subId++}`, []);

    useEffect(() => {
        assertEventBus(eventBus);

        eventBus.subscribers[subId] = { callback };

        return () => delete eventBus.subscribers[subId];
    }, [assertEventBus, eventBus, subId, callback]);
}
