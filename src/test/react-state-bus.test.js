import React, { useEffect, useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { stateBus, useStateBus, useStateBusSetter, useStateBusValue } from '../main';

const setup1 = (nameBus) => {
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

const setup2 = (nameBus) => {
    const renderCount = {
        inputName: 0,
        displayName: 0,
        noSubscriber: 0,
    };

    const App = () => {
        return (
            <React.Fragment>
                <InputName />
                <DisplayName />
                <NoSubscriber />
            </React.Fragment>
        );
    };

    const InputName = () => {
        const [name, setName] = useStateBus(nameBus);

        renderCount.inputName++;

        return (
            <div>
                <input id={'input'} type={'text'} onChange={(e) => setName(e.target.value)} value={name} />
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
    };
};

const setup3 = (nameBus) => {
    const renderCount = { app: 0 };

    const App = () => {
        const [, forceUpdate] = useState({});
        const [name, setName] = useStateBus(nameBus);

        useEffect(() => {
            renderCount.app++;

            if (renderCount.app > 2) {
                return;
            }

            forceUpdate({});
        }, [name, setName]);

        return <React.Fragment />;
    };

    const utils = render(<App />);

    return { renderCount };
};

describe('stateBus', () => {
    it('구독한 컴포넌트만 렌더링 - useStateBusValue, useStateBusSetter', () => {
        const nameBus = stateBus('john');
        const { renderCount, getInput, getDisplay } = setup1(nameBus);

        expect(getDisplay()).toHaveTextContent('john');
        expect(renderCount).toEqual({ inputName: 1, displayName: 1, noSubscriber: 1 });

        fireEvent.change(getInput(), { target: { value: 'test-1' } });
        fireEvent.change(getInput(), { target: { value: 'test-2' } });

        expect(getDisplay()).toHaveTextContent('test-2');
        expect(renderCount).toEqual({ inputName: 1, displayName: 3, noSubscriber: 1 });
    });

    it('구독한 컴포넌트만 렌더링 - useStateBus', () => {
        const nameBus = stateBus('john');
        const { renderCount, getInput, getDisplay } = setup2(nameBus);

        expect(getDisplay()).toHaveTextContent('john');
        expect(renderCount).toEqual({ inputName: 1, displayName: 1, noSubscriber: 1 });

        fireEvent.change(getInput(), { target: { value: 'test-1' } });
        fireEvent.change(getInput(), { target: { value: 'test-2' } });

        expect(getDisplay()).toHaveTextContent('test-2');
        expect(renderCount).toEqual({ inputName: 3, displayName: 3, noSubscriber: 1 });
    });

    it('컴포넌트에서 useStateBusValue 사용시 구독 등록, 컴포넌트 unmount시 구독 해제', () => {
        const nameBus = stateBus('john');
        const { getDisplay, getToggle } = setup1(nameBus);

        expect(getDisplay()).toBeTruthy();
        expect(Object.values(nameBus.subscribers).length).toEqual(1);

        fireEvent.click(getToggle());

        expect(getDisplay()).not.toBeTruthy();
        expect(Object.values(nameBus.subscribers).length).toEqual(0);

        fireEvent.click(getToggle());

        expect(getDisplay()).toBeTruthy();
        expect(Object.values(nameBus.subscribers).length).toEqual(1);
    });

    it('올바르게 memoize 처리되는지 확인', () => {
        const nameBus = stateBus('john');
        const { renderCount } = setup3(nameBus);

        expect(renderCount.app).toEqual(1);
    });
});
