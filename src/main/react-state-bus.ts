import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BUS_TYPE, context } from './react-bus-core';

function assertStateBus(stateBus) {
    if (stateBus.type !== BUS_TYPE.STATE_BUS) {
        throw new Error(`${stateBus.type} is not invalid type -> ${BUS_TYPE.STATE_BUS}`);
    }
}

function assertStateBusList(stateBusList) {
    stateBusList.forEach((_stateBus) => assertStateBus(_stateBus));
}

export function stateBus(defaultValue) {
    return {
        type: BUS_TYPE.STATE_BUS,
        subscribers: {},
        get: () => defaultValue,
    };
}

export function getStateBusValues(...stateBusList) {
    assertStateBusList(stateBusList);

    return stateBusList.map((_stateBus) => _stateBus.get());
}

export function setStateBusValues(...params) {
    assertStateBusList(params.map(([_stateBus]) => _stateBus));

    const subscribers = {};

    for (const [_stateBus, _value] of params) {
        _stateBus.get = () => _value;

        for (const [subId, subscriber] of Object.entries(_stateBus.subscribers)) {
            subscribers[subId] = subscriber;
        }
    }

    Object.values(subscribers).forEach((_subscriber: any) => _subscriber.callback());
}

export function useStateBus(defaultValue) {
    return useRef(stateBus(defaultValue)).current;
}

export function useStateBusValue(...stateBusList) {
    const [, forceUpdate] = useState({});
    const subId = useMemo(() => `sub-${context.subId++}`, []);

    useEffect(() => {
        assertStateBusList(stateBusList);

        stateBusList.forEach((_stateBus) => (_stateBus.subscribers[subId] = { callback: () => forceUpdate({}) }));

        return () => stateBusList.forEach((_stateBus) => delete _stateBus.subscribers[subId]);
    }, [assertStateBusList, stateBusList, subId]);

    return stateBusList.map((_stateBus) => _stateBus.get());
}

export function useStateBusSetter(...stateBusList) {
    useEffect(() => {
        assertStateBusList(stateBusList);
    }, [assertStateBusList, stateBusList]);

    return stateBusList.map((_stateBus) =>
        useCallback(
            (value) => {
                _stateBus.get = () => value;

                Object.values(_stateBus.subscribers).forEach((subscriber: any) => subscriber.callback());
            },
            [_stateBus],
        ),
    );
}
