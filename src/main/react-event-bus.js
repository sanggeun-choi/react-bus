import { useCallback, useEffect, useMemo, useRef } from 'react';
import BUS_CONST from './react-bus-consts';

export default (context) => {
    const assertEventBus = (eventBus) => {
        if (eventBus.type !== BUS_CONST.TYPE.EVENT_BUS) {
            throw new Error(`${eventBus.type} is not invalid type -> ${BUS_CONST.TYPE.EVENT_BUS}`);
        }
    };

    const assertEventBusList = (eventBusList) => {
        eventBusList.forEach((_eventBus) => assertEventBus(_eventBus));
    };

    const eventBus = () => {
        return {
            type: BUS_CONST.TYPE.EVENT_BUS,
            subscribers: {},
        };
    };

    const useEventBus = () => {
        return useRef(eventBus()).current;
    };

    const useEventBusCaller = (...eventBusList) => {
        useEffect(() => {
            assertEventBusList(eventBusList);
        }, [assertEventBusList, eventBusList]);

        return eventBusList.map((_eventBus) =>
            useCallback(
                (...params) => {
                    return Object.values(_eventBus.subscribers).forEach((subscriber) => subscriber.callback(...params));
                },
                [_eventBus],
            ),
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

    return { eventBus, useEventBus, useEventBusCaller, useEventBusListener };
};
