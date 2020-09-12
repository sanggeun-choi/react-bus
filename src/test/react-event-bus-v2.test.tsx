import React, { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { createEventBus, useEventBusSelector } from '../main';

const setupCallbackSubscriberOnlyTest = () => {
    const changeNameBus = createEventBus();
    const changeNumberBus = createEventBus();

    const renderCount = {
        displayName: 0,
        displayNumber: 0,
    };

    const DisplayName = () => {
        const [name, setName] = useState('');

        renderCount.displayName++;

        useEventBusSelector(changeNameBus, (_name) => {
            setName(_name);
        });

        return <div id={'display-name'}>{name}</div>;
    };

    const DisplayNumber = () => {
        const [number, setNumber] = useState('');

        renderCount.displayNumber++;

        useEventBusSelector(changeNumberBus, (_number) => {
            setNumber(_number);
        });

        return <div id={'display-number'}>{number}</div>;
    };

    const App = () => {
        return (
            <React.Fragment>
                <DisplayName />
                <DisplayNumber />
            </React.Fragment>
        );
    };

    const utils = render(<App />);

    return {
        renderCount,
        changeNameBus,
        changeNumberBus,
        getDisplayName: () => utils.container.querySelector('#display-name'),
        getDisplayNumber: () => utils.container.querySelector('#display-number'),
    };
};

const setupSubscribeAndUnsubscribeTest = () => {
    const changeNameBus = createEventBus();

    const Display = () => {
        const [name, setName] = useState('');

        useEventBusSelector(changeNameBus, (_name) => {
            setName(_name);
        });

        return <div id={'display'}>{name}</div>;
    };

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

    const { container } = render(<App />);

    return {
        changeNameBus,
        getToggle: () => container.querySelector('#toggle'),
        getDisplay: () => container.querySelector('#display'),
    };
};

const setupMemoization = () => {
    const getNameEventBus = createEventBus();
    const context = { renderCount: 0, name: 'john' };

    const App = () => {
        const [name, setName] = useState(context.name);

        context.renderCount++;

        useEventBusSelector(getNameEventBus, () => {
            context.name = name;
        });

        return (
            <React.Fragment>
                <button id={'change'} onClick={() => setName('tom')}>
                    change name
                </button>
            </React.Fragment>
        );
    };

    const { container } = render(<App />);

    return { getNameEventBus, context, getChange: () => container.querySelector('#change') };
};

describe('eventBus', () => {
    it('구독한 컴포넌트만 이벤트 수신', () => {
        const { renderCount, changeNameBus, changeNumberBus, getDisplayName, getDisplayNumber } = setupCallbackSubscriberOnlyTest();

        expect(getDisplayName()).toHaveTextContent('');
        expect(getDisplayNumber()).toHaveTextContent('');
        expect(renderCount).toEqual({ displayName: 1, displayNumber: 1 });

        changeNameBus.dispatch('john');

        expect(getDisplayName()).toHaveTextContent('john');
        expect(getDisplayNumber()).toHaveTextContent('');
        expect(renderCount).toEqual({ displayName: 2, displayNumber: 1 });

        changeNumberBus.dispatch(100);

        expect(getDisplayName()).toHaveTextContent('john');
        expect(getDisplayNumber()).toHaveTextContent('100');
        expect(renderCount).toEqual({ displayName: 2, displayNumber: 2 });
    });

    it('subscribe, unsubscribe 테스트', () => {
        const { changeNameBus, getToggle, getDisplay } = setupSubscribeAndUnsubscribeTest();

        expect(getDisplay()).toBeInTheDocument();
        expect(Object.values(changeNameBus.getSubscribers()).length).toEqual(1);

        fireEvent.click(getToggle());

        expect(getDisplay()).not.toBeInTheDocument();
        expect(Object.values(changeNameBus.getSubscribers()).length).toEqual(0);

        fireEvent.click(getToggle());

        expect(getDisplay()).toBeInTheDocument();
        expect(Object.values(changeNameBus.getSubscribers()).length).toEqual(1);
    });

    it('memoization 테스트', () => {
        const { getNameEventBus, context, getChange } = setupMemoization();

        expect(context.renderCount).toEqual(1);
        expect(context.name).toEqual('john');

        fireEvent.click(getChange());
        getNameEventBus.dispatch();

        expect(context.renderCount).toEqual(2);
        expect(context.name).toEqual('tom');
    });
});
