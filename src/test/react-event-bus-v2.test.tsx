import React, { useEffect, useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { createEventBus, useEventBusSelector } from '../main';

const setupCallbackSubsciberOnlyTest = () => {
    const changeNameBus = createEventBus();
    const changeNumberBus = createEventBus();

    const renderCount = {
        inputName: 0,
        displayName: 0,
        inputNumber: 0,
        displayNumber: 0,
    };

    const App = () => {
        return (
            <React.Fragment>
                <DisplayName />
                <InputName />
                <DisplayNumber />
                <InputNumber />
            </React.Fragment>
        );
    };

    const InputName = () => {
        renderCount.inputName++;

        return (
            <div>
                <input id={'input-name'} type={'text'} onChange={(e) => changeNameBus.dispatch(e.target.value)} />
            </div>
        );
    };

    const DisplayName = () => {
        const [name, setName] = useState('');

        renderCount.displayName++;

        useEventBusSelector(changeNameBus, (_name) => {
            setName(_name);
        });

        return <div id={'display-name'}>{name}</div>;
    };

    const InputNumber = () => {
        renderCount.inputNumber++;

        return (
            <div>
                <input id={'input-number'} type={'number'} onChange={(e) => changeNumberBus.dispatch(e.target.value)} />
            </div>
        );
    };

    const DisplayNumber = () => {
        const [number, setNumber] = useState('');

        renderCount.displayNumber++;

        useEventBusSelector(changeNumberBus, (_number) => {
            setNumber(_number);
        });

        return <div id={'display-number'}>{number}</div>;
    };

    const utils = render(<App />);

    return {
        renderCount,
        getInputName: () => utils.container.querySelector('#input-name'),
        getInputNumber: () => utils.container.querySelector('#input-number'),
        getDisplayName: () => utils.container.querySelector('#display-name'),
        getDisplayNumber: () => utils.container.querySelector('#display-number'),
    };
};

const setupSubscribeAndUnsubscribe = () => {
    const changeNameBus = createEventBus();

    const App = () => {
        const [toggle, setToggle] = useState(true);

        return (
            <React.Fragment>
                {toggle && <Display />}
                <button id={'toggle'} onClick={() => setToggle(!toggle)}>
                    toggle
                </button>
            </React.Fragment>
        );
    };

    const Display = () => {
        const [name, setName] = useState('');

        useEventBusSelector(changeNameBus, (_name) => {
            setName(_name);
        });

        return <div id={'display'}>{name}</div>;
    };

    const { container } = render(<App />);

    return {
        changeNameBus,
        getToggle: () => container.querySelector('#toggle'),
        getDisplay: () => container.querySelector('#display'),
    };
};

const setupMemoization = () => {
    const changeNameBus = createEventBus();
    const renderCount = { app: 0 };

    const App = () => {
        const [, forceUpdate] = useState({});

        useEffect(() => {
            renderCount.app++;

            if (renderCount.app > 1) {
                return;
            }

            forceUpdate({});
        }, [changeNameBus]);

        return <React.Fragment />;
    };

    const utils = render(<App />);

    return { renderCount, changeNameBus };
};

describe('eventBus', () => {
    it('구독한 컴포넌트만 이벤트 수신', () => {
        const { renderCount, getDisplayName, getDisplayNumber, getInputName, getInputNumber } = setupCallbackSubsciberOnlyTest();

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

    it('컴포넌트에서 useEventBusSelector 사용시 구독 등록, 컴포넌트 unmount시 구독 해제', () => {
        const { changeNameBus, getToggle, getDisplay } = setupSubscribeAndUnsubscribe();

        expect(getDisplay()).toBeInTheDocument();
        expect(Object.values(changeNameBus.subscribers).length).toEqual(1);

        fireEvent.click(getToggle());

        expect(getDisplay()).not.toBeInTheDocument();
        expect(Object.values(changeNameBus.subscribers).length).toEqual(0);

        fireEvent.click(getToggle());

        expect(getDisplay()).toBeInTheDocument();
        expect(Object.values(changeNameBus.subscribers).length).toEqual(1);
    });

    it('올바르게 memoize 처리되는지 확인', () => {
        const { renderCount } = setupMemoization();

        expect(renderCount.app).toEqual(1);
    });
});
