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
const userStateBusFamily = stateBusFamily({
    name: 'john',
    number: 100,
});

const App = () => {
    // local
    // const userStateBusFamily = useStateBusFamily({
    //     name: 'john',
    //     number: 100,
    // });

    return (
        <React.Fragment>
            <Input />
            <Display />
            <button
                onClick={() => {
                    const { name, number } = getStateBusFamilyValues(userStateBusFamily);
                    console.log(name, number);
                }}
            >
                get values
            </button>
        </React.Fragment>
    );
};

const Input = () => {
    const [setName] = useStateBusSetter(userStateBusFamily.name);

    return (
        <div>
            input :
            <input type={'text'} onChange={(e) => setName(e.target.value)} />
        </div>
    );
};

const Display = () => {
    const [name] = useStateBusValue(userStateBusFamily.name);

    return <div>display : {name}</div>;
};
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

### eventBusFamily
```javascript
import React, { useState } from 'react';
import {
    eventBusFamily,
    useEventBusCaller,
    useEventBusFamily,
    useEventBusListener,
} from '@iore8655/react-bus';

// global
const userEventBusFamily = eventBusFamily('onChangeName', 'onChangeNumber');

const App = () => {
    // local
    // const userEventBusFamily = useEventBusFamily('onChangeName', 'onChangeNumber');

    return (
        <React.Fragment>
            <Input />
            <Display />
        </React.Fragment>
    );
};

const Input = () => {
    const [onChangeName, onChangeNumber] = useEventBusCaller(
        userEventBusFamily.onChangeName,
        userEventBusFamily.onChangeNumber,
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

    useEventBusListener(userEventBusFamily.onChangeName, (_name) => {
        setName(_name);
    });

    return <div>display : {name}</div>;
};
```

### memoBus
```javascript
import React from 'react';
import { memoBus, stateBus, useMemoBus, useStateBusSetter } from '@iore8655/react-bus';

const numberBus = stateBus(0);
const nameBus = stateBus('');

const infoBus = memoBus((number, name) => `${number} - ${name}`, [numberBus, nameBus]);

const App = () => {
    return (
        <React.Fragment>
            <InputNumber />
            <InputName />
            <DisplayInfo />
        </React.Fragment>
    );
};

const InputNumber = () => {
    const [setNumber] = useStateBusSetter(numberBus);

    return (
        <div>
            input number :
            <input type={'number'} onChange={(e) => setNumber(e.target.value)} />
        </div>
    );
};

const InputName = () => {
    const [setName] = useStateBusSetter(nameBus);

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
import React from 'react';
import axios from 'axios';
import {
    memoBusAsync,
    stateBus,
    useMemoBus,
    useStateBusSetter,
} from '@iore8655/react-bus';

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

const App = () => {
    return (
        <React.Fragment>
            <InputNumber />
            <DisplayInfo />
        </React.Fragment>
    );
};

const InputNumber = () => {
    const [setNumber] = useStateBusSetter(numberBus);

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