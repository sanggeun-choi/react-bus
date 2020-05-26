import reactStateBus from './react-state-bus';
import reactEventBus from './react-event-bus';
import reactMemoBus from './react-memo-bus';

const context = {
    subscribers: {},
    subId: 0,
    busId: 0,
};

const { stateBus, useStateBusValue, useStateBusSetter, useStateBus } = reactStateBus(context);
const { eventBus, useEventBusCaller, useEventBusListener } = reactEventBus(context);
const { memoBus, useMemoBus } = reactMemoBus(context);

export {
    stateBus,
    useStateBusValue,
    useStateBusSetter,
    useStateBus,
    eventBus,
    useEventBusCaller,
    useEventBusListener,
    memoBus,
    useMemoBus,
};
