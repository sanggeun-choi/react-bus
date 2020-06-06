import { eventBus } from './index';
import { useRef } from 'react';

export default () => {
    const eventBusFamily = (...eventBusNames) => {
        return eventBusNames.reduce((family, eventBusName) => {
            family[eventBusName] = eventBus();
            return family;
        }, {});
    };

    const useEventBusFamily = (...eventBusNames) => {
        return useRef(eventBusFamily(...eventBusNames)).current;
    };

    return { eventBusFamily, useEventBusFamily };
};
