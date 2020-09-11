import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BUS_CONST from './react-bus-consts';

const context = { subId: 0 };

export const assertStateBus = (stateBus) => {
    if (stateBus.type !== BUS_CONST.TYPE.STATE_BUS) {
        throw new Error(`${stateBus.type} is not invalid type -> ${BUS_CONST.TYPE.STATE_BUS}`);
    }
};

export const assertStateBusList = (stateBusList) => {
    stateBusList.forEach((_stateBus) => assertStateBus(_stateBus));
};

export const stateBus = (defaultValue) => {
    return {
        type: BUS_CONST.TYPE.STATE_BUS,
        subscribers: {},
        get: () => defaultValue,
    };
};

export const getStateBusValues = (...stateBusList) => {
    assertStateBusList(stateBusList);

    return stateBusList.map((_stateBus) => _stateBus.get());
};

export const setStateBusValues = (...params) => {
    assertStateBusList(params.map(([_stateBus]) => _stateBus));

    const subscribers = {};

    for (const [_stateBus, _value] of params) {
        _stateBus.get = () => _value;

        for (const [subId, subscriber] of Object.entries(_stateBus.subscribers)) {
            subscribers[subId] = subscriber;
        }
    }

    Object.values(subscribers).forEach((_subscriber) => _subscriber.callback());
};

export const useStateBus = (defaultValue) => {
    return useRef(stateBus(defaultValue)).current;
};

export const useStateBusValue = (...stateBusList) => {
    const [, forceUpdate] = useState({});
    const subId = useMemo(() => `sub-${context.subId++}`, []);

    useEffect(() => {
        assertStateBusList(stateBusList);

        stateBusList.forEach((_stateBus) => (_stateBus.subscribers[subId] = { callback: () => forceUpdate({}) }));

        return () => stateBusList.forEach((_stateBus) => delete _stateBus.subscribers[subId]);
    }, [assertStateBusList, stateBusList, subId]);

    return stateBusList.map((_stateBus) => _stateBus.get());
};

export const useStateBusSetter = (...stateBusList) => {
    useEffect(() => {
        assertStateBusList(stateBusList);
    }, [assertStateBusList, stateBusList]);

    return stateBusList.map((_stateBus) =>
        useCallback(
            (value) => {
                _stateBus.get = () => value;

                Object.values(_stateBus.subscribers).forEach((subscriber) => subscriber.callback());
            },
            [_stateBus],
        ),
    );
};
