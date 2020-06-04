import { useCallback, useEffect, useMemo, useState } from 'react';
import BUS_CONST from './react-bus-consts';

export default (context) => {
    const assertStateBus = (stateBus) => {
        if (stateBus.type !== BUS_CONST.TYPE.STATE_BUS) {
            throw Error(`This is not ${BUS_CONST.TYPE.STATE_BUS} - ${stateBus.type}`);
        }
    };

    const stateBus = (value) => {
        return {
            type: BUS_CONST.TYPE.STATE_BUS,
            subscribers: {},
            get: () => value,
        };
    };

    const useStateBusValue = (stateBus) => {
        const [, forceUpdate] = useState({});
        const subId = useMemo(() => `sub-${context.subId++}`, []);

        useEffect(() => {
            assertStateBus(stateBus);

            stateBus.subscribers[subId] = { callback: () => forceUpdate({}) };

            return () => delete stateBus.subscribers[subId];
        }, [subId, stateBus, assertStateBus]);

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

    const useStateBus = (stateBus) => {
        const state = useStateBusValue(stateBus);
        const setState = useStateBusSetter(stateBus);

        return [state, setState];
    };

    return { stateBus, useStateBusValue, useStateBusSetter, useStateBus };
};
