import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BUS_CONST from './react-bus-consts';

export default (context) => {
    const assertStateBus = (stateBus) => {
        if (stateBus.type !== BUS_CONST.TYPE.STATE_BUS) {
            throw Error(`This is not ${BUS_CONST.TYPE.STATE_BUS} - ${stateBus.type}`);
        }
    };

    const stateBus = (defaultValue) => {
        return {
            type: BUS_CONST.TYPE.STATE_BUS,
            subscribers: {},
            get: () => defaultValue,
        };
    };

    const useStateBus = (defaultValue) => {
        return useRef(stateBus(defaultValue)).current;
    };

    const useStateBusValue = (stateBus) => {
        const [, forceUpdate] = useState({});
        const subId = useMemo(() => `sub-${context.subId++}`, []);

        useEffect(() => {
            assertStateBus(stateBus);

            stateBus.subscribers[subId] = { callback: () => forceUpdate({}) };

            return () => delete stateBus.subscribers[subId];
        }, [assertStateBus, stateBus, subId]);

        return stateBus.get();
    };

    const useStateBusSetter = (stateBus) => {
        useEffect(() => {
            assertStateBus(stateBus);
        }, [assertStateBus, stateBus]);

        return useCallback(
            (value) => {
                stateBus.get = () => value;

                Object.values(stateBus.subscribers).forEach((subscriber) => subscriber.callback());
            },
            [stateBus],
        );
    };

    return { stateBus, useStateBus, useStateBusValue, useStateBusSetter };
};
