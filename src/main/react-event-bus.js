import { useCallback, useEffect, useMemo } from 'react';
import BUS_CONST from './react-bus-consts';

export default (context) => {
    const assertEventBus = (eventBus) => {
        if (eventBus.type !== BUS_CONST.TYPE.EVENT_BUS) {
            throw Error(`This is not ${BUS_CONST.TYPE.EVENT_BUS} - ${eventBus.type}`);
        }
    };

    const eventBus = () => {
        return {
            type: BUS_CONST.TYPE.EVENT_BUS,
            subscribers: {},
        };
    };

    const useEventBusCaller = (eventBus) => {
        useEffect(() => {
            assertEventBus(eventBus);
        }, [assertEventBus, eventBus]);

        return useCallback(
            (...params) => {
                return Object.values(eventBus.subscribers).forEach((subscriber) => subscriber.callback(...params));
            },
            [eventBus],
        );
    };

    const useEventBusListener = (eventBus, callback, deps) => {
        const subId = useMemo(() => `sub-${context.subId++}`, []);

        useEffect(() => {
            assertEventBus(eventBus);

            eventBus.subscribers[subId] = { callback };

            return () => delete eventBus.subscribers[subId];
        }, [assertEventBus, eventBus, subId, callback, ...deps]);
    };

    return { eventBus, useEventBusCaller, useEventBusListener };
};
