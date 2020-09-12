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
    useStateBusReset,
    useStateBusSelector,
} from '@iore8655/react-bus';

const stateBus = createStateBus({
    name: 'john',
    number: 0,
});

const eventBus = createEventBus();

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

    useStateBusReset(stateBus); // call stateBus.reset() when mounted/unmounted

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
            <DisplayName />
            <DisplayNumber />
            <Controller />
        </React.Fragment>
    );
};

export default App;
```

---

# Old Example

### stateBus
```javascript
import React from 'react';
import {
    stateBus,
    useStateBus,
    useStateBusSetter,
    useStateBusValue,
} from '@iore8655/react-bus';

// global
const nameBus = stateBus('');
const numberBus = stateBus(0);

const App = () => {
    // local
    // const nameBus = useStateBus('');
    // const numberBus = useStateBus(0);

    return (
        <React.Fragment>
            <Input />
            <Display />
        </React.Fragment>
    );
};

const Input = () => {
    const [setName, setNumber] = useStateBusSetter(nameBus, numberBus);

    return (
        <div>
            input :
            <input type={'text'} onChange={(e) => setName(e.target.value)} />
        </div>
    );
};

const Display = () => {
    const [name, number] = useStateBusValue(nameBus, numberBus);

    return <div>display : {name}</div>;
};
```


### stateBus - getStateBusValues, setStateBusValues
```javascript
import { stateBus, getStateBusValues, setStateBusValues } from '@iore8655/react-bus';

const nameBus = stateBus('');
const numberBus = stateBus(0);

const [name, number] = getStateBusValues(nameBus, numberBus);

setStateBusValues([nameBus, 'john'], [numberBus, 200]);
```


### eventBus
```javascript
import React, { useState } from 'react';
import {
    eventBus,
    useEventBus,
    useEventBusCaller,
    useEventBusListener,
} from '@iore8655/react-bus';

// global
const onChangeNameBus = eventBus();
const onChangeNumberBus = eventBus();

const App = () => {
    // local
    // const onChangeNameBus = useEventBus();
    // const onChangeNumberBus = useEventBus();

    return (
        <React.Fragment>
            <Input />
            <Display />
        </React.Fragment>
    );
};

const Input = () => {
    const [onChangeName, onChangeNumber] = useEventBusCaller(
        onChangeNameBus,
        onChangeNumberBus,
    );

    return (
        <div>
            input :
            <input type={'text'} onChange={(e) => onChangeName(e.target.value)} />
        </div>
    );
};

const Display = () => {
    const [name, setName] = useState('');

    useEventBusListener(onChangeNameBus, (_name) => {
        setName(_name);
    });

    return <div>display : {name}</div>;
};
```
