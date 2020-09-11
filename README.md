# @iore8655/react-bus
- @iore8655/react-bus is a global/local state management by pub/sub
- render only subscribers


### install
```shell
npm install @iore8655/react-bus
```
```shell
yarn add @iore8655/react-bus
```


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