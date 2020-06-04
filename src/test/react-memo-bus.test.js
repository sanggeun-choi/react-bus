import React, { useEffect, useState } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { memoBus, memoBusAsync, stateBus, useMemoBus, useStateBusSetter, useStateBusValue } from '../main';

const setup = (nameBus, numberBus, infoBus) => {
    const renderCount = {
        inputName: 0,
        displayName: 0,
        inputNumber: 0,
        displayNumber: 0,
        displayInfo: 0,
    };

    const App = () => {
        const [toggle, setToggle] = useState(true);

        return (
            <React.Fragment>
                <button id={'toggle'} onClick={() => setToggle(!toggle)}>
                    toggle
                </button>
                <DisplayName />
                <InputName />
                <DisplayNumber />
                <InputNumber />
                {toggle && <DisplayInfo />}
            </React.Fragment>
        );
    };

    const InputName = () => {
        const setName = useStateBusSetter(nameBus);

        renderCount.inputName++;

        return (
            <div>
                <input id={'input-name'} type={'text'} onChange={(e) => setName(e.target.value)} />
            </div>
        );
    };

    const DisplayName = () => {
        const name = useStateBusValue(nameBus);

        renderCount.displayName++;

        return <div id={'display-name'}>{name}</div>;
    };

    const InputNumber = () => {
        const setNumber = useStateBusSetter(numberBus);

        renderCount.inputNumber++;

        return (
            <div>
                <input id={'input-number'} type={'number'} onChange={(e) => setNumber(e.target.value)} />
            </div>
        );
    };

    const DisplayNumber = () => {
        const number = useStateBusValue(numberBus);

        renderCount.displayNumber++;

        return <div id={'display-number'}>{number}</div>;
    };

    const DisplayInfo = () => {
        const info = useMemoBus(infoBus);

        renderCount.displayInfo++;

        return <div id={'display-info'}>{info}</div>;
    };

    const utils = render(<App />);

    return {
        renderCount,
        getInputName: () => utils.container.querySelector('#input-name'),
        getInputNumber: () => utils.container.querySelector('#input-number'),
        getDisplayName: () => utils.container.querySelector('#display-name'),
        getDisplayNumber: () => utils.container.querySelector('#display-number'),
        getDisplayInfo: () => utils.container.querySelector('#display-info'),
        getToggle: () => utils.container.querySelector('#toggle'),
    };
};

const setup2 = (infoBus) => {
    const renderCount = { app: 0 };

    const App = () => {
        const [, forceUpdate] = useState({});
        const info = useMemoBus(infoBus);

        useEffect(() => {
            renderCount.app++;

            if (renderCount.app > 2) {
                return;
            }

            forceUpdate({});
        }, [info]);

        return <React.Fragment />;
    };

    const utils = render(<App />);

    return { renderCount };
};

describe('memoBus', () => {
    it('구독한 컴포넌트만 렌더링', () => {
        const nameBus = stateBus('john');
        const numberBus = stateBus(100);
        const infoBus = memoBus((name, number) => `${name} : ${number}`, [nameBus, numberBus]);
        const { renderCount, getInputName, getInputNumber, getDisplayInfo } = setup(nameBus, numberBus, infoBus);

        expect(getDisplayInfo()).toHaveTextContent('john : 100'), { interval: 1000 };
        expect(renderCount).toEqual({ inputName: 1, displayName: 1, inputNumber: 1, displayNumber: 1, displayInfo: 1 });

        fireEvent.change(getInputName(), { target: { value: 'tom' } });

        expect(getDisplayInfo()).toHaveTextContent('tom : 100'), { interval: 1000 };
        expect(renderCount).toEqual({ inputName: 1, displayName: 2, inputNumber: 1, displayNumber: 1, displayInfo: 2 });

        fireEvent.change(getInputNumber(), { target: { value: 200 } });

        expect(getDisplayInfo()).toHaveTextContent('tom : 200'), { interval: 1000 };
        expect(renderCount).toEqual({ inputName: 1, displayName: 2, inputNumber: 1, displayNumber: 2, displayInfo: 3 });
    });

    it('구독한 컴포넌트만 렌더링 - Async', async () => {
        const nameBus = stateBus('john');
        const numberBus = stateBus(100);
        const infoBus = memoBusAsync(async (name, number) => `${name} : ${number}`, [nameBus, numberBus]);
        const { renderCount, getInputName, getInputNumber, getDisplayInfo } = setup(nameBus, numberBus, infoBus);

        await waitFor(() => expect(getDisplayInfo()).toHaveTextContent('john : 100'), { interval: 1000 });
        expect(renderCount).toEqual({ inputName: 1, displayName: 1, inputNumber: 1, displayNumber: 1, displayInfo: 2 });

        fireEvent.change(getInputName(), { target: { value: 'tom' } });

        await waitFor(() => expect(getDisplayInfo()).toHaveTextContent('tom : 100'), { interval: 1000 });
        expect(renderCount).toEqual({ inputName: 1, displayName: 2, inputNumber: 1, displayNumber: 1, displayInfo: 3 });

        fireEvent.change(getInputNumber(), { target: { value: 200 } });

        await waitFor(() => expect(getDisplayInfo()).toHaveTextContent('tom : 200'), { interval: 1000 });
        expect(renderCount).toEqual({ inputName: 1, displayName: 2, inputNumber: 1, displayNumber: 2, displayInfo: 4 });
    });

    it('컴포넌트에서 useMemoBus 사용시 stateBus에 구독 등록, 컴포넌트 unmount시 구독 해제', () => {
        const nameBus = stateBus('john');
        const numberBus = stateBus(100);
        const infoBus = memoBus((name, number) => `${name} : ${number}`, [nameBus, numberBus]);
        const { getDisplayInfo, getToggle } = setup(nameBus, numberBus, infoBus);

        expect(getDisplayInfo()).toBeTruthy();
        expect(Object.values(nameBus.subscribers).length).toEqual(2);
        expect(Object.values(numberBus.subscribers).length).toEqual(2);

        fireEvent.click(getToggle());

        expect(getDisplayInfo()).not.toBeTruthy();
        expect(Object.values(nameBus.subscribers).length).toEqual(1);
        expect(Object.values(numberBus.subscribers).length).toEqual(1);

        fireEvent.click(getToggle());

        expect(getDisplayInfo()).toBeTruthy();
        expect(Object.values(nameBus.subscribers).length).toEqual(2);
        expect(Object.values(numberBus.subscribers).length).toEqual(2);
    });

    it('올바르게 memoize 처리되는지 확인', () => {
        const nameBus = stateBus('john');
        const numberBus = stateBus(100);
        const infoBus = memoBus((name, number) => `${name} : ${number}`, [nameBus, numberBus]);
        const asyncInfoBus = memoBusAsync(async (name, number) => await `${name} : ${number}`, [nameBus, numberBus]);
        const { renderCount: renderCount1 } = setup2(infoBus);
        const { renderCount: renderCount2 } = setup2(asyncInfoBus);

        expect(renderCount1.app).toEqual(1);
        expect(renderCount2.app).toEqual(1);
    });
});
