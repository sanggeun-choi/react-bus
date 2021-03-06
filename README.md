# @iore8655/react-bus
- @iore8655/react-bus is a global/local state management by pub/sub
- render only subscribers


### Install
```shell
npm install @iore8655/react-bus
```
```shell
yarn add @iore8655/react-bus
```

### Basic Example
```javascript
import React from 'react';
import {
    createEventBus,
    createStateBus,
    useEventBusSelector,
    useStateBusSelector,
} from '@iore8655/react-bus';

const stateBus = createStateBus({
    name: 'john',
    number: 0,
});

const eventBus = createEventBus();

const DisplayAll = () => {
    const { name, number } = useStateBusSelector(stateBus);

    return (
        <React.Fragment>
            <div>name : {name}</div>
            <div>number : {number}</div>
        </React.Fragment>
    );
};

const DisplayName = () => {
    const name = useStateBusSelector(stateBus, (state) => state.name);

    useEventBusSelector(eventBus, (message) => {
        console.log(message);
    });

    return (
        <React.Fragment>
            <div>name : {name}</div>
        </React.Fragment>
    );
};

const DisplayNumber = () => {
    const number = useStateBusSelector(stateBus, (state) => state.number);

    useEventBusSelector(eventBus, (message) => {
        console.log(message);
    });

    return (
        <React.Fragment>
            <div>number : {number}</div>
        </React.Fragment>
    );
};

const Controller = () => {
    return (
        <div>
            <button onClick={() => stateBus.dispatch((state) => (state.number += 1))}>
                increase
            </button>
            <button onClick={() => stateBus.dispatch({ number: stateBus.getState().number - 1 })}>
                decrease
            </button>
            <button onClick={() => console.log(stateBus.getState())}>getState()</button>
            <button onClick={() => stateBus.reset()}>reset</button>
            <button onClick={() => stateBus.restore({ name: 'tom', number: 1 })}>restore</button>
            <button onClick={() => eventBus.dispatch('Hello World')}>event</button>
        </div>
    );
};

const App = () => {
    return (
        <React.Fragment>
            <DisplayAll />
            <DisplayName />
            <DisplayNumber />
            <Controller />
        </React.Fragment>
    );
};

export default App;
```
