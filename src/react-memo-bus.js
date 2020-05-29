import { useEffect, useMemo, useState } from 'react';
import lodash from 'lodash';
import BUS_CONST from './react-bus-consts';

export default (context) => {
    const memoBus = (getter, stateBusDeps) => {
        if (lodash.some(stateBusDeps, (stateBus) => stateBus.type !== BUS_CONST.TYPE.STATE_BUS)) {
            throw Error(`contains invalid bus type in stateBusDeps - ${stateBusDeps.map((stateBus) => stateBus.type)}`);
        }

        return {
            type: BUS_CONST.TYPE.MEMO_BUS,
            get: getter,
            stateBusDeps,
        };
    };

    const useMemoBus = (memoBus) => {
        const [state, setState] = useState(undefined);
        const subId = useMemo(() => `sub-${context.subId++}`, []);

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

            memoBus.stateBusDeps.forEach((stateBus) => (stateBus.subscribers[subId] = { callback }));

            return () => memoBus.stateBusDeps.forEach((stateBus) => delete stateBus.subscribers[subId]);
        }, [subId, memoBus]);

        return state;
    };

    return { memoBus, useMemoBus };
};
