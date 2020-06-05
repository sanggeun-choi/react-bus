# react-bus
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

const StateBusExam = () => {
    // local
    // const nameBus = useStateBus('');

    return (
        <React.Fragment>
            <InputName />
            <DisplayName />
        </React.Fragment>
    );
};

const InputName = () => {
    const setName = useStateBusSetter(nameBus);

    return (
        <div>
            input :
            <input type={'text'} onChange={(e) => setName(e.target.value)} />
        </div>
    );
};

const DisplayName = () => {
    const name = useStateBusValue(nameBus);

    return <div>display : {name}</div>;
};

```

### stateBusFamily
```javascript
import React from 'react';
import {
    stateBusFamily,
    useStateBusFamily,
    getStateBusFamilyValues,
    useStateBusSetter,
    useStateBusValue,
} from '@iore8655/react-bus';

// global
const userBusFamily = stateBusFamily({
    name: 'john',
    number: 100,
});

const StateBusFamilyExam = () => {
    // local
    // const userBusFamily = useStateBusFamily({
    //     name: 'john',
    //     number: 100,
    // });

    return (
        <React.Fragment>
            <InputName />
            <DisplayName />
            <button
                onClick={() => {
                    const { name, number } = getStateBusFamilyValues(userBusFamily);
                    console.log(name, number);
                }}
            >
                get values
            </button>
        </React.Fragment>
    );
};

const InputName = () => {
    const setName = useStateBusSetter(userBusFamily.name);

    return (
        <div>
            input :
            <input type={'text'} onChange={(e) => setName(e.target.value)} />
        </div>
    );
};

const DisplayName = () => {
    const name = useStateBusValue(userBusFamily.name);

    return <div>display : {name}</div>;
};
```


### eventBus
```javascript
import { eventBus, useEventBusCaller, useEventBusListener } from '@iore8655/react-bus';

const changeNameBus = eventBus();

const EventBusExam = () => {
    return (
        <React.Fragment>
            <InputName />
            <DisplayName />
        </React.Fragment>
    );
};

const InputName = () => {
    const changeName = useEventBusCaller(changeNameBus);

    return (
        <div>
            input :
            <input type={'text'} onChange={(e) => changeName(e.target.value)} />
        </div>
    );
};

const DisplayName = () => {
    const [name, setName] = useState('');

    useEventBusListener(
        changeNameBus,
        (_name) => {
            setName(_name);
        },
        [],
    );

    return <div>display : {name}</div>;
};
```

### memoBus
```javascript
import { memoBus, stateBus, useMemoBus, useStateBusSetter } from '@iore8655/react-bus';

const numberBus = stateBus(0);
const nameBus = stateBus('');

const infoBus = memoBus((number, name) => `${number} - ${name}`, [numberBus, nameBus]);

const MemoBusExam = () => {
    return (
        <React.Fragment>
            <InputNumber />
            <InputName />
            <DisplayInfo />
        </React.Fragment>
    );
};

const InputNumber = () => {
    const setNumber = useStateBusSetter(numberBus);

    return (
        <div>
            input number :
            <input type={'number'} onChange={(e) => setNumber(e.target.value)} />
        </div>
    );
};

const InputName = () => {
    const setName = useStateBusSetter(nameBus);

    return (
        <div>
            input name :
            <input type={'text'} onChange={(e) => setName(e.target.value)} />
        </div>
    );
};

const DisplayInfo = () => {
    const info = useMemoBus(infoBus);

    return <div>display : {info}</div>;
};
```

### memoBusAsync
```javascript
import axios from 'axios';
import { memoBusAsync, stateBus, useMemoBus, useStateBusSetter } from '@iore8655/react-bus';

const numberBus = stateBus(0);

const infoBus = memoBusAsync(
    async (number) => {
        if (number === undefined || number <= 0) {
            return '';
        }

        const response = await axios.get(`https://api.example.com/todos/${number}`);

        return response.data.title;
    },
    [numberBus],
);

const MemoBusExam = () => {
    return (
        <React.Fragment>
            <InputNumber />
            <DisplayInfo />
        </React.Fragment>
    );
};

const InputNumber = () => {
    const setNumber = useStateBusSetter(numberBus);

    return (
        <div>
            input number :
            <input type={'number'} onChange={(e) => setNumber(e.target.value)} />
        </div>
    );
};

const DisplayInfo = () => {
    const info = useMemoBus(infoBus);

    return <div>display : {info}</div>;
};
```