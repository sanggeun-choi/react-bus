import { useCallback, useEffect, useMemo, useRef } from 'react';
import BUS_CONST from './react-bus-consts';

const context = { subId: 0 };

export const assertEventBus = (eventBus) => {
    if (eventBus.type !== BUS_CONST.TYPE.EVENT_BUS) {
        throw new Error(`${eventBus.type} is not invalid type -> ${BUS_CONST.TYPE.EVENT_BUS}`);
    }
};

export const assertEventBusList = (eventBusList) => {
    eventBusList.forEach((_eventBus) => assertEventBus(_eventBus));
};

export const eventBus = () => {
    return {
        type: BUS_CONST.TYPE.EVENT_BUS,
        subscribers: {},
    };
};

export const useEventBus = () => {
    return useRef(eventBus()).current;
};

export const useEventBusCaller = (...eventBusList) => {
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

export const useEventBusListener = (eventBus, callback) => {
    const subId = useMemo(() => `sub-${context.subId++}`, []);

    useEffect(() => {
        assertEventBus(eventBus);

        eventBus.subscribers[subId] = { callback };

        return () => delete eventBus.subscribers[subId];
    }, [assertEventBus, eventBus, subId, callback]);
};
