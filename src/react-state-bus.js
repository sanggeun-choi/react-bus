import { useEffect, useMemo, useState } from 'react';
import lodash from 'lodash';
import BUS_CONST from './react-bus-consts';

export default (context) => {
    const stateBus = (value) => {
        return {
            type: BUS_CONST.TYPE.STATE_BUS,
            busId: `bus-${context.busId++}`,
            get: () => value,
        };
    };

    const useStateBusValue = (stateBus) => {
        const _subId = useMemo(() => `sub-${context.subId++}`, []);
        const [state, setState] = useState(stateBus.get());

        if (stateBus.type !== BUS_CONST.TYPE.STATE_BUS) {
            throw Error(`This is not ${BUS_CONST.TYPE.STATE_BUS} - ${stateBus.type}`);
        }

        useEffect(() => {
            lodash.set(context.subscribers, `${stateBus.busId}.${_subId}`, {
                callback: () => setState(stateBus.get()),
            });

            return () => {
                delete context.subscribers[stateBus.busId][_subId];
            };
        }, [_subId, stateBus]);

        return state;
    };

    const useStateBusSetter = (stateBus) => {
        if (stateBus.type !== BUS_CONST.TYPE.STATE_BUS) {
            throw Error(`This is not ${BUS_CONST.TYPE.STATE_BUS} - ${stateBus.type}`);
        }

        return (_value) => {
            stateBus.get = () => _value;

            Object.values(
                lodash.get(context.subscribers, stateBus.busId, {}),
            ).forEach((_subscriber) => _subscriber.callback());
        };
    };

    const useStateBus = (stateBus) => {
        const state = useStateBusValue(stateBus);
        const setState = useStateBusSetter(stateBus);

        return [state, setState];
    };

    return { stateBus, useStateBusValue, useStateBusSetter, useStateBus };
};
