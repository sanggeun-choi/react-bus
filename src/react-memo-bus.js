import { useEffect, useMemo, useState } from 'react';
import lodash from 'lodash';
import BUS_CONST from './react-bus-consts';

export default (context) => {
    const memoBus = (getter, stateBusDeps) => {
        if (lodash.some(stateBusDeps, (stateBus) => stateBus.type !== BUS_CONST.TYPE.STATE_BUS)) {
            throw Error(
                `contains invalid bus type in stateBusDeps - ${stateBusDeps.map(
                    (stateBus) => stateBus.type,
                )}`,
            );
        }

        return {
            type: BUS_CONST.TYPE.MEMO_BUS,
            busId: `bus-${context.busId++}`,
            get: getter,
            stateBusDeps,
        };
    };

    const useMemoBus = (memoBus) => {
        const _subId = useMemo(() => `sub-${context.subId++}`, []);
        const [state, setState] = useState(undefined);

        if (memoBus.type !== BUS_CONST.TYPE.MEMO_BUS) {
            throw Error(`This is not ${BUS_CONST.TYPE.MEMO_BUS} - ${memoBus.type}`);
        }

        useEffect(() => {
            const callback = async () => {
                const stateValues = memoBus.stateBusDeps.map((stateBus) => stateBus.get());
                const result = await memoBus.get(...stateValues);

                setState(result);
            };

            callback();

            memoBus.stateBusDeps.forEach((stateBus) => {
                lodash.set(context.subscribers, `${stateBus.busId}.${_subId}`, {
                    callback,
                });
            });

            return () => {
                memoBus.stateBusDeps.forEach((stateBus) => {
                    delete context.subscribers[stateBus.busId][_subId];
                });
            };
        }, [_subId, memoBus]);

        return state;
    };

    return { memoBus, useMemoBus };
};
