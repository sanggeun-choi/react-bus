import { useRef } from 'react';
import { setStateBusValues, stateBus } from './index';

export default () => {
    const stateBusFamily = (defaultValues) => {
        return Object.entries(defaultValues).reduce((result, [key, value]) => {
            result[key] = stateBus(value);
            return result;
        }, {});
    };

    const useStateBusFamily = (defaultValues) => {
        return useRef(stateBusFamily(defaultValues)).current;
    };

    const getStateBusFamilyValues = (stateBusFamily) => {
        return Object.entries(stateBusFamily).reduce((result, [key, stateBus]) => {
            result[key] = stateBus.get();
            return result;
        }, {});
    };

    const setStateBusFamilyValues = (stateBusFamily, params) => {
        const _params = Object.entries(params).map(([key, value]) => {
            const _stateBus = stateBusFamily[key];

            if (!_stateBus) {
                throw new Error(`${key} is not included in stateBusFamily`);
            }

            return [_stateBus, value];
        });

        setStateBusValues(..._params);
    };

    return { stateBusFamily, useStateBusFamily, getStateBusFamilyValues, setStateBusFamilyValues };
};
