import React, { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { setStateBusFamily, stateBus, useStateBusFamily, useStateBusSetter, useStateBusValue } from '../main';

const setup = (nameBus) => {
    const renderCount = {
        inputName: 0,
        displayName: 0,
        noSubscriber: 0,
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
                <NoSubscriber />
            </React.Fragment>
        );
    };

    const InputName = () => {
        const setName = useStateBusSetter(nameBus);

        renderCount.inputName++;

        return (
            <div>
                <input id={'input'} type={'text'} onChange={(e) => setName(e.target.value)} />
            </div>
        );
    };

    const DisplayName = () => {
        const name = useStateBusValue(nameBus);

        renderCount.displayName++;

        return <div id={'display'}>{name}</div>;
    };

    const NoSubscriber = () => {
        renderCount.noSubscriber++;

        return <div>NoSubscriber</div>;
    };

    const utils = render(<App />);

    return {
        renderCount,
        getInput: () => utils.container.querySelector('#input'),
        getDisplay: () => utils.container.querySelector('#display'),
        getToggle: () => utils.container.querySelector('#toggle'),
    };
};

const setup2 = () => {
    const nameBus = stateBus('john');
    const isCheckBus = stateBus(true);
    const renderCount = { app: 0, displayName: 0, displayDetails: 0 };

    const App = () => {
        renderCount.app++;

        return (
            <div
                id={'change-states'}
                onClick={() => {
                    setStateBusFamily([nameBus, 'tom'], [isCheckBus, false]);
                }}
            >
                <DisplayName />
                <DisplayDetails />
            </div>
        );
    };

    const DisplayName = () => {
        const name = useStateBusValue(nameBus);

        renderCount.displayName++;

        return <div id={'display-name'}>{name}</div>;
    };

    const DisplayDetails = () => {
        const [name, isCheck] = useStateBusFamily(nameBus, isCheckBus);

        renderCount.displayDetails++;

        return (
            <div id={'display-details'}>
                {name} : {isCheck ? 'Y' : 'N'}
            </div>
        );
    };

    const utils = render(<App />);

    return {
        renderCount,
        getChangeStates: () => utils.container.querySelector('#change-states'),
        getDisplayName: () => utils.container.querySelector('#display-name'),
        getDisplayDetails: () => utils.container.querySelector('#display-details'),
    };
};

describe('stateBus', () => {
    it('구독한 컴포넌트만 렌더링', () => {
        const nameBus = stateBus('john');
        const { renderCount, getInput, getDisplay } = setup(nameBus);

        expect(getDisplay()).toHaveTextContent('john');
        expect(renderCount).toEqual({ inputName: 1, displayName: 1, noSubscriber: 1 });

        fireEvent.change(getInput(), { target: { value: 'test-1' } });
        fireEvent.change(getInput(), { target: { value: 'test-2' } });

        expect(getDisplay()).toHaveTextContent('test-2');
        expect(renderCount).toEqual({ inputName: 1, displayName: 3, noSubscriber: 1 });
    });

    it('컴포넌트에서 useStateBusValue 사용시 구독 등록, 컴포넌트 unmount시 구독 해제', () => {
        const nameBus = stateBus('john');
        const { getDisplay, getToggle } = setup(nameBus);

        expect(getDisplay()).toBeTruthy();
        expect(Object.values(nameBus.subscribers).length).toEqual(1);

        fireEvent.click(getToggle());

        expect(getDisplay()).not.toBeTruthy();
        expect(Object.values(nameBus.subscribers).length).toEqual(0);

        fireEvent.click(getToggle());

        expect(getDisplay()).toBeTruthy();
        expect(Object.values(nameBus.subscribers).length).toEqual(1);
    });

    it('useStateBusFamily, setStateBusFamily로 다중 stateBus 세팅시 한 번만 렌더링 되어야함', () => {
        const { renderCount, getChangeStates, getDisplayName, getDisplayDetails } = setup2();

        expect(getDisplayName()).toHaveTextContent('john');
        expect(getDisplayDetails()).toHaveTextContent('john : Y');
        expect(renderCount).toEqual({ app: 1, displayName: 1, displayDetails: 1 });

        fireEvent.click(getChangeStates());

        expect(getDisplayName()).toHaveTextContent('tom');
        expect(getDisplayDetails()).toHaveTextContent('tom : N');
        expect(renderCount).toEqual({ app: 1, displayName: 2, displayDetails: 2 });
    });
});
