import { useEffect, useMemo } from 'react';
import lodash from 'lodash';
import BUS_CONST from './react-bus-consts';

export default (context) => {
    const eventBus = () => {
        return {
            type: BUS_CONST.TYPE.EVENT_BUS,
            busId: `bus-${context.busId++}`,
        };
    };

    const useEventBusCaller = (eventBus) => {
        if (eventBus.type !== BUS_CONST.TYPE.EVENT_BUS) {
            throw Error(`This is not ${BUS_CONST.TYPE.EVENT_BUS} - ${eventBus.type}`);
        }

        return (...params) => {
            Object.values(
                lodash.get(context.subscribers, eventBus.busId, {}),
            ).forEach((_subscriber) => _subscriber.callback(...params));
        };
    };

    const useEventBusListener = (eventBus, callback, deps) => {
        const _subId = useMemo(() => `sub-${context.subId++}`, []);

        if (eventBus.type !== BUS_CONST.TYPE.EVENT_BUS) {
            throw Error(`This is not ${BUS_CONST.TYPE.EVENT_BUS} - ${eventBus.type}`);
        }

        useEffect(() => {
            lodash.set(context.subscribers, `${eventBus.busId}.${_subId}`, { callback });

            return () => {
                delete context.subscribers[eventBus.busId][_subId];
            };
        }, [_subId, eventBus.busId, callback, ...deps]);
    };

    return { eventBus, useEventBusCaller, useEventBusListener };
};
