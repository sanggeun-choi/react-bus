import { useEffect, useMemo, useState } from 'react';
import lodash from 'lodash';
import BUS_CONST from './react-bus-consts';
import useIsMounted from './use-is-mounted';

export default (context) => {
    const assertStateBusDeps = (stateBusDeps) => {
        if (lodash.some(stateBusDeps, (stateBus) => stateBus.type !== BUS_CONST.TYPE.STATE_BUS)) {
            throw Error(`contains invalid bus type in stateBusDeps - ${stateBusDeps.map((stateBus) => stateBus.type)}`);
        }
    };

    const assertMemoBus = (memoBus) => {
        if (!lodash.includes(BUS_CONST.MEMO_BUS_TYPES, memoBus.type)) {
            throw Error(`invalid memoBus type - [expected: ${BUS_CONST.MEMO_BUS_TYPES.join(',')}, actual: ${memoBus.type}]`);
        }
    };

    const memoBus = (getter, stateBusDeps) => {
        assertStateBusDeps(stateBusDeps);

        return {
            type: BUS_CONST.TYPE.MEMO_BUS,
            get: getter,
            stateBusDeps,
        };
    };

    const memoBusAsync = (getter, stateBusDeps) => {
        assertStateBusDeps(stateBusDeps);

        return {
            type: BUS_CONST.TYPE.MEMO_BUS_ASYNC,
            get: getter,
            stateBusDeps,
        };
    };

    const useMemoBus = (memoBus) => {
        return memoBus.type === BUS_CONST.TYPE.MEMO_BUS_ASYNC ? useMemoBusAsync(memoBus) : useMemoBusSync(memoBus);
    };

    const useMemoBusSync = (memoBus) => {
        const [state, setState] = useState(memoBus.get(...memoBus.stateBusDeps.map((stateBus) => stateBus.get())));
        const subId = useMemo(() => `sub-${context.subId++}`, []);

        assertMemoBus(memoBus);

        useEffect(() => {
            const callback = () => {
                const result = memoBus.get(...memoBus.stateBusDeps.map((stateBus) => stateBus.get()));

                setState(result);
            };

            memoBus.stateBusDeps.forEach((stateBus) => (stateBus.subscribers[subId] = { callback }));

            return () => memoBus.stateBusDeps.forEach((stateBus) => delete stateBus.subscribers[subId]);
        }, [subId, memoBus]);

        return state;
    };

    const useMemoBusAsync = (memoBus) => {
        const [state, setState] = useState(undefined);
        const subId = useMemo(() => `sub-${context.subId++}`, []);
        const { isMounted } = useIsMounted();

        assertMemoBus(memoBus);

        useEffect(() => {
            const callback = async () => {
                const result = await memoBus.get(...memoBus.stateBusDeps.map((stateBus) => stateBus.get()));

                if (isMounted()) {
                    setState(result);
                }
            };

            callback();

            memoBus.stateBusDeps.forEach((stateBus) => (stateBus.subscribers[subId] = { callback }));

            return () => memoBus.stateBusDeps.forEach((stateBus) => delete stateBus.subscribers[subId]);
        }, [subId, memoBus]);

        return state;
    };

    return { memoBus, memoBusAsync, useMemoBus };
};
