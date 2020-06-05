import reactStateBus from './react-state-bus';
import reactStateBusFamily from './react-state-bus-family';
import reactEventBus from './react-event-bus';
import reactMemoBus from './react-memo-bus';

const context = { subId: 0 };

const { stateBus, useStateBusValue, useStateBusSetter, useStateBus } = reactStateBus(context);
const { stateBusFamily, useStateBusFamily, getStateBusFamilyValues } = reactStateBusFamily(context);
const { eventBus, useEventBusCaller, useEventBusListener } = reactEventBus(context);
const { memoBus, memoBusAsync, useMemoBus } = reactMemoBus(context);

export {
    stateBus,
    useStateBusValue,
    useStateBusSetter,
    useStateBus,
    stateBusFamily,
    useStateBusFamily,
    getStateBusFamilyValues,
    eventBus,
    useEventBusCaller,
    useEventBusListener,
    memoBus,
    memoBusAsync,
    useMemoBus,
};
