import { useEffect, useMemo, useState } from 'react';
import BUS_CONST from './react-bus-consts';

export default (context) => {
    const stateBus = (value) => {
        return {
            type: BUS_CONST.TYPE.STATE_BUS,
            subscribers: {},
            get: () => value,
        };
    };

    const assertStateBus = (stateBus) => {
        if (stateBus.type !== BUS_CONST.TYPE.STATE_BUS) {
            throw Error(`This is not ${BUS_CONST.TYPE.STATE_BUS} - ${stateBus.type}`);
        }
    };

    const useStateBusValue = (stateBus) => {
        const [state, setState] = useState(stateBus.get());
        const subId = useMemo(() => `sub-${context.subId++}`, []);

        assertStateBus(stateBus);

        useEffect(() => {
            stateBus.subscribers[subId] = { callback: () => setState(stateBus.get()) };

            return () => delete stateBus.subscribers[subId];
        }, [subId, stateBus]);

        return state;
    };

    const useStateBusSetter = (stateBus) => {
        assertStateBus(stateBus);

        return (value) => {
            stateBus.get = () => value;

            Object.values(stateBus.subscribers).forEach((subscriber) => subscriber.callback());
        };
    };

    const useStateBus = (stateBus) => {
        const state = useStateBusValue(stateBus);
        const setState = useStateBusSetter(stateBus);

        return [state, setState];
    };

    return { stateBus, useStateBusValue, useStateBusSetter, useStateBus };
};
