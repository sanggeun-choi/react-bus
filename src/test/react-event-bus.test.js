import React, { useEffect, useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { eventBus, useEventBusCaller, useEventBusListener } from '../main';

const setup = (changeNameBus, changeNumberBus) => {
    const renderCount = {
        inputName: 0,
        displayName: 0,
        inputNumber: 0,
        displayNumber: 0,
    };

    const App = () => {
        const [toggle, setToggle] = useState(true);

        return (
            <React.Fragment>
                <button id={'toggle'} onClick={() => setToggle(!toggle)}>
                    toggle
                </button>
                {toggle && <DisplayName />}
                <InputName />
                <DisplayNumber />
                <InputNumber />
            </React.Fragment>
        );
    };

    const InputName = () => {
        const changeName = useEventBusCaller(changeNameBus);

        renderCount.inputName++;

        return (
            <div>
                <input id={'input-name'} type={'text'} onChange={(e) => changeName(e.target.value)} />
            </div>
        );
    };

    const DisplayName = () => {
        const [name, setName] = useState('');

        renderCount.displayName++;

        useEventBusListener(
            changeNameBus,
            (_name) => {
                setName(_name);
            },
            [],
        );

        return <div id={'display-name'}>{name}</div>;
    };

    const InputNumber = () => {
        const changeNumber = useEventBusCaller(changeNumberBus);

        renderCount.inputNumber++;

        return (
            <div>
                <input id={'input-number'} type={'number'} onChange={(e) => changeNumber(e.target.value)} />
            </div>
        );
    };

    const DisplayNumber = () => {
        const [number, setNumber] = useState('');

        renderCount.displayNumber++;

        useEventBusListener(
            changeNumberBus,
            (_number) => {
                setNumber(_number);
            },
            [],
        );

        return <div id={'display-number'}>{number}</div>;
    };

    const utils = render(<App />);

    return {
        renderCount,
        getInputName: () => utils.container.querySelector('#input-name'),
        getInputNumber: () => utils.container.querySelector('#input-number'),
        getDisplayName: () => utils.container.querySelector('#display-name'),
        getDisplayNumber: () => utils.container.querySelector('#display-number'),
        getToggle: () => utils.container.querySelector('#toggle'),
    };
};

const setup2 = (changeNameBus) => {
    const renderCount = { app: 0 };

    const App = () => {
        const [, forceUpdate] = useState({});
        const changeName = useEventBusCaller(changeNameBus);

        useEffect(() => {
            renderCount.app++;

            if (renderCount.app > 2) {
                return;
            }

            forceUpdate({});
        }, [changeName]);

        return <React.Fragment />;
    };

    const utils = render(<App />);

    return { renderCount };
};

describe('eventBus', () => {
    it('구독한 컴포넌트만 이벤트 수신', () => {
        const changeNameBus = eventBus();
        const changeNumberBus = eventBus();
        const { renderCount, getDisplayName, getDisplayNumber, getInputName, getInputNumber } = setup(changeNameBus, changeNumberBus);

        expect(getDisplayName()).toHaveTextContent('');
        expect(getDisplayNumber()).toHaveTextContent('');
        expect(renderCount).toEqual({ inputName: 1, displayName: 1, inputNumber: 1, displayNumber: 1 });

        fireEvent.change(getInputName(), { target: { value: 'john' } });

        expect(getDisplayName()).toHaveTextContent('john');
        expect(getDisplayNumber()).toHaveTextContent('');
        expect(renderCount).toEqual({ inputName: 1, displayName: 2, inputNumber: 1, displayNumber: 1 });

        fireEvent.change(getInputNumber(), { target: { value: 100 } });

        expect(getDisplayName()).toHaveTextContent('john');
        expect(getDisplayNumber()).toHaveTextContent('100');
        expect(renderCount).toEqual({ inputName: 1, displayName: 2, inputNumber: 1, displayNumber: 2 });
    });

    it('컴포넌트에서 useEventBusListener 사용시 구독 등록, 컴포넌트 unmount시 구독 해제', () => {
        const changeNameBus = eventBus();
        const changeNumberBus = eventBus();
        const { getDisplayName, getToggle } = setup(changeNameBus, changeNumberBus);

        expect(getDisplayName()).toBeTruthy();
        expect(Object.values(changeNameBus.subscribers).length).toEqual(1);
        expect(Object.values(changeNumberBus.subscribers).length).toEqual(1);

        fireEvent.click(getToggle());

        expect(getDisplayName()).not.toBeTruthy();
        expect(Object.values(changeNameBus.subscribers).length).toEqual(0);
        expect(Object.values(changeNumberBus.subscribers).length).toEqual(1);

        fireEvent.click(getToggle());

        expect(getDisplayName()).toBeTruthy();
        expect(Object.values(changeNameBus.subscribers).length).toEqual(1);
        expect(Object.values(changeNumberBus.subscribers).length).toEqual(1);
    });

    it('올바르게 memoize 처리되는지 확인', () => {
        const changeNameBus = eventBus();
        const { renderCount } = setup2(changeNameBus);

        expect(renderCount.app).toEqual(1);
    });
});
