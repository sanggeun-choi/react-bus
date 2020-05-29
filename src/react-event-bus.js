import { useEffect, useMemo } from 'react';
import BUS_CONST from './react-bus-consts';

export default (context) => {
    const eventBus = () => {
        return {
            type: BUS_CONST.TYPE.EVENT_BUS,
            subscribers: {},
        };
    };

    const assertEventBus = (eventBus) => {
        if (eventBus.type !== BUS_CONST.TYPE.EVENT_BUS) {
            throw Error(`This is not ${BUS_CONST.TYPE.EVENT_BUS} - ${eventBus.type}`);
        }
    };

    const useEventBusCaller = (eventBus) => {
        assertEventBus(eventBus);

        return (...params) => Object.values(eventBus.subscribers).forEach((subscriber) => subscriber.callback(...params));
    };

    const useEventBusListener = (eventBus, callback, deps) => {
        const subId = useMemo(() => `sub-${context.subId++}`, []);

        assertEventBus(eventBus);

        useEffect(() => {
            eventBus.subscribers[subId] = { callback };

            return () => eventBus.subscribers[subId];
        }, [subId, eventBus, callback, ...deps]);
    };

    return { eventBus, useEventBusCaller, useEventBusListener };
};
