import reactStateBus from './react-state-bus';
import reactStateBusFamily from './react-state-bus-family';
import reactEventBus from './react-event-bus';
import reactEventBusFamily from './react-event-bus-family';
import reactMemoBus from './react-memo-bus';

const context = { subId: 0 };

const { stateBus, getStateBusValues, setStateBusValues, useStateBus, useStateBusValue, useStateBusSetter } = reactStateBus(context);
const { stateBusFamily, useStateBusFamily, getStateBusFamilyValues, setStateBusFamilyValues } = reactStateBusFamily(context);
const { eventBus, useEventBus, useEventBusCaller, useEventBusListener } = reactEventBus(context);
const { eventBusFamily, useEventBusFamily } = reactEventBusFamily(context);
const { memoBus, memoBusAsync, useMemoBus } = reactMemoBus(context);

export {
    stateBus,
    getStateBusValues,
    setStateBusValues,
    useStateBus,
    useStateBusValue,
    useStateBusSetter,
    stateBusFamily,
    useStateBusFamily,
    getStateBusFamilyValues,
    setStateBusFamilyValues,
    eventBus,
    useEventBus,
    useEventBusCaller,
    useEventBusListener,
    eventBusFamily,
    useEventBusFamily,
    memoBus,
    memoBusAsync,
    useMemoBus,
};
