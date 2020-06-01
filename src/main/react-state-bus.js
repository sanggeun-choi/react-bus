import { useEffect, useMemo, useState } from 'react';
import lodash from 'lodash';
import BUS_CONST from './react-bus-consts';

export default (context) => {
    const stateBus = (value) => {
        return {
            type: BUS_CONST.TYPE.STATE_BUS,
            subscribers: {},
            get: () => value,
        };
    };

    const useStateBusValue = (stateBus) => {
        const [value] = useStateBus(stateBus);

        return value;
    };

    const useStateBusSetter = (stateBus) => {
        return (value) => setStateBus([stateBus, value]);
    };

    const useStateBus = (...stateBus) => {
        const [, forceUpdate] = useState({});
        const subId = useMemo(() => `sub-${context.subId++}`, []);

        useEffect(() => {
            if (lodash.some(stateBus, (_stateBus) => _stateBus.type !== BUS_CONST.TYPE.STATE_BUS)) {
                throw Error(`contains invalid type : [${stateBus.map((_stateBus) => _stateBus.type).join(',')}]`);
            }

            stateBus.forEach((_stateBus) => (_stateBus.subscribers[subId] = { callback: () => forceUpdate({}) }));

            return () => stateBus.forEach((_stateBus) => delete _stateBus.subscribers[subId]);
        }, [subId, stateBus]);

        return stateBus.map((_stateBus) => _stateBus.get());
    };

    const setStateBus = (...params) => {
        if (lodash.some(params, ([_stateBus]) => _stateBus.type !== BUS_CONST.TYPE.STATE_BUS)) {
            throw Error(`contains invalid type : [${params.map(([_stateBus]) => _stateBus.type).join(',')}]`);
        }

        let subscribers = {};

        params.forEach(([_stateBus, _value]) => {
            _stateBus.get = () => _value;
            subscribers = { ...subscribers, ..._stateBus.subscribers };
        });

        Object.values(subscribers).forEach((_subscriber) => _subscriber.callback());
    };

    return { stateBus, useStateBusValue, useStateBusSetter, useStateBus, setStateBus };
};
