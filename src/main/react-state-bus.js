import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BUS_CONST from './react-bus-consts';

export default (context) => {
    const assertStateBus = (stateBus) => {
        if (stateBus.type !== BUS_CONST.TYPE.STATE_BUS) {
            throw new Error(`${stateBus.type} is not invalid type -> ${BUS_CONST.TYPE.STATE_BUS}`);
        }
    };

    const assertStateBusList = (stateBusList) => {
        stateBusList.forEach((_stateBus) => assertStateBus(_stateBus));
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

    const useStateBusValue = (...stateBusList) => {
        const [, forceUpdate] = useState({});
        const subId = useMemo(() => `sub-${context.subId++}`, []);

        useEffect(() => {
            assertStateBusList(stateBusList);

            stateBusList.forEach((_stateBus) => (_stateBus.subscribers[subId] = { callback: () => forceUpdate({}) }));

            return () => stateBusList.forEach((_stateBus) => delete _stateBus.subscribers[subId]);
        }, [assertStateBusList, stateBusList, subId]);

        return stateBusList.map((_stateBus) => _stateBus.get());
    };

    const useStateBusSetter = (...stateBusList) => {
        useEffect(() => {
            assertStateBusList(stateBusList);
        }, [assertStateBusList, stateBusList]);

        return stateBusList.map((_stateBus) =>
            useCallback((value) => {
                _stateBus.get = () => value;

                Object.values(_stateBus.subscribers).forEach((subscriber) => subscriber.callback());
            }, [_stateBus]),
        );
    };

    return { stateBus, useStateBus, useStateBusValue, useStateBusSetter };
};
