import { useRef } from 'react';
import { stateBus } from './index';

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

    return { stateBusFamily, useStateBusFamily, getStateBusFamilyValues };
};
