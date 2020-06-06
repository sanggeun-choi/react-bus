import React, { useEffect, useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { eventBusFamily, useEventBusCaller, useEventBusFamily, useEventBusListener } from '../main';

const setupGlobalEventBusFamily = () => {
    const userEventBusFamily = eventBusFamily('changeName', 'changeNumber');
    const renderCount = { inputName: 0, displayName: 0, inputNumber: 0, displayNumber: 0 };

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
        const [changeName] = useEventBusCaller(userEventBusFamily.changeName);

        renderCount.inputName++;

        return <input id={'input-name'} type={'text'} onChange={(e) => changeName(e.target.value)} />;
    };

    const DisplayName = () => {
        const [name, setName] = useState('');

        renderCount.displayName++;

        useEventBusListener(
            userEventBusFamily.changeName,
            (_name) => {
                setName(_name);
            },
            [],
        );

        return <div id={'display-name'}>{name}</div>;
    };

    const InputNumber = () => {
        const [changeNumber] = useEventBusCaller(userEventBusFamily.changeNumber);

        renderCount.inputNumber++;

        return <input id={'input-number'} type={'number'} onChange={(e) => changeNumber(e.target.value)} />;
    };

    const DisplayNumber = () => {
        const [number, setNumber] = useState(0);

        renderCount.displayNumber++;

        useEventBusListener(
            userEventBusFamily.changeNumber,
            (_number) => {
                setNumber(_number);
            },
            [],
        );

        return <div id={'display-number'}>{number}</div>;
    };

    const { container } = render(<App />);

    return {
        renderCount,
        getInputName: () => container.querySelector('#input-name'),
        getDisplayName: () => container.querySelector('#display-name'),
        getInputNumber: () => container.querySelector('#input-number'),
        getDisplayNumber: () => container.querySelector('#display-number'),
    };
};

const setupLocalEventBusFamily = () => {
    const renderCount = { inputName: 0, displayName: 0, inputNumber: 0, displayNumber: 0 };

    const App = () => {
        const userEventBusFamily = useEventBusFamily('changeName', 'changeNumber');

        return (
            <React.Fragment>
                <DisplayName userEventBusFamily={userEventBusFamily} />
                <InputName userEventBusFamily={userEventBusFamily} />
                <DisplayNumber userEventBusFamily={userEventBusFamily} />
                <InputNumber userEventBusFamily={userEventBusFamily} />
            </React.Fragment>
        );
    };

    const InputName = ({ userEventBusFamily }) => {
        const [changeName] = useEventBusCaller(userEventBusFamily.changeName);

        renderCount.inputName++;

        return <input id={'input-name'} type={'text'} onChange={(e) => changeName(e.target.value)} />;
    };

    const DisplayName = ({ userEventBusFamily }) => {
        const [name, setName] = useState('');

        renderCount.displayName++;

        useEventBusListener(
            userEventBusFamily.changeName,
            (_name) => {
                setName(_name);
            },
            [],
        );

        return <div id={'display-name'}>{name}</div>;
    };

    const InputNumber = ({ userEventBusFamily }) => {
        const [changeNumber] = useEventBusCaller(userEventBusFamily.changeNumber);

        renderCount.inputNumber++;

        return <input id={'input-number'} type={'number'} onChange={(e) => changeNumber(e.target.value)} />;
    };

    const DisplayNumber = ({ userEventBusFamily }) => {
        const [number, setNumber] = useState(0);

        renderCount.displayNumber++;

        useEventBusListener(
            userEventBusFamily.changeNumber,
            (_number) => {
                setNumber(_number);
            },
            [],
        );

        return <div id={'display-number'}>{number}</div>;
    };

    const { container } = render(<App />);

    return {
        renderCount,
        getInputName: () => container.querySelector('#input-name'),
        getDisplayName: () => container.querySelector('#display-name'),
        getInputNumber: () => container.querySelector('#input-number'),
        getDisplayNumber: () => container.querySelector('#display-number'),
    };
};

const setupMemoization = () => {
    const renderCount = { app: 0 };

    const App = () => {
        const [, forceUpdate] = useState({});
        const userEventBusFamily = useEventBusFamily('changeName', 'changeNumber');

        useEffect(() => {
            renderCount.app++;

            if (renderCount.app > 1) {
                return;
            }

            forceUpdate({});
        }, [userEventBusFamily]);

        return <React.Fragment />;
    };

    const utils = render(<App />);

    return { renderCount };
};

describe('eventBusFamily', () => {
    it('구독한 컴포넌트만 이벤트 수신 - global', () => {
        const { renderCount, getDisplayName, getInputName, getInputNumber, getDisplayNumber } = setupGlobalEventBusFamily();

        expect(getDisplayName()).toHaveTextContent('');
        expect(getDisplayNumber()).toHaveTextContent('0');
        expect(renderCount).toEqual({ inputName: 1, displayName: 1, inputNumber: 1, displayNumber: 1 });

        fireEvent.change(getInputName(), { target: { value: 'john' } });

        expect(getDisplayName()).toHaveTextContent('john');
        expect(getDisplayNumber()).toHaveTextContent('0');
        expect(renderCount).toEqual({ inputName: 1, displayName: 2, inputNumber: 1, displayNumber: 1 });

        fireEvent.change(getInputNumber(), { target: { value: 100 } });

        expect(getDisplayName()).toHaveTextContent('john');
        expect(getDisplayNumber()).toHaveTextContent('100');
        expect(renderCount).toEqual({ inputName: 1, displayName: 2, inputNumber: 1, displayNumber: 2 });
    });

    it('구독한 컴포넌트만 이벤트 수신 - local', () => {
        const { renderCount, getDisplayName, getInputName, getInputNumber, getDisplayNumber } = setupLocalEventBusFamily();

        expect(getDisplayName()).toHaveTextContent('');
        expect(getDisplayNumber()).toHaveTextContent('0');
        expect(renderCount).toEqual({ inputName: 1, displayName: 1, inputNumber: 1, displayNumber: 1 });

        fireEvent.change(getInputName(), { target: { value: 'john' } });

        expect(getDisplayName()).toHaveTextContent('john');
        expect(getDisplayNumber()).toHaveTextContent('0');
        expect(renderCount).toEqual({ inputName: 1, displayName: 2, inputNumber: 1, displayNumber: 1 });

        fireEvent.change(getInputNumber(), { target: { value: 100 } });

        expect(getDisplayName()).toHaveTextContent('john');
        expect(getDisplayNumber()).toHaveTextContent('100');
        expect(renderCount).toEqual({ inputName: 1, displayName: 2, inputNumber: 1, displayNumber: 2 });
    });

    it('올바르게 memoize 처리되는지 확인', () => {
        const { renderCount } = setupMemoization();

        expect(renderCount.app).toEqual(1);
    });
});
