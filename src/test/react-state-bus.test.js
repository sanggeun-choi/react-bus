import React, { useEffect, useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { getStateBusValues, setStateBusValues, stateBus, useStateBus, useStateBusSetter, useStateBusValue } from '../main';

const setupGlobalStateBus = () => {
    const nameBus = stateBus('john');
    const renderCount = { app: 0, display: 0, input: 0, noSubscriber: 0 };

    const App = () => {
        renderCount.app++;

        return (
            <React.Fragment>
                <Display />
                <Input />
                <NoSubscriber />
            </React.Fragment>
        );
    };

    const Display = () => {
        const [name] = useStateBusValue(nameBus);

        renderCount.display++;

        return <div id={'display'}>{name}</div>;
    };

    const Input = () => {
        const [setName] = useStateBusSetter(nameBus);

        renderCount.input++;

        return <input id={'input'} type={'text'} onChange={(e) => setName(e.target.value)} />;
    };

    const NoSubscriber = () => {
        renderCount.noSubscriber++;

        return <React.Fragment />;
    };

    const { container } = render(<App />);

    return {
        renderCount,
        getDisplay: () => container.querySelector('#display'),
        getInput: () => container.querySelector('#input'),
    };
};

const setupLocalStateBus = () => {
    const renderCount = { app: 0, display: 0, input: 0, noSubscriber: 0 };

    const App = () => {
        const nameBus = useStateBus('john');

        renderCount.app++;

        return (
            <React.Fragment>
                <Display nameBus={nameBus} />
                <Input nameBus={nameBus} />
                <NoSubscriber />
            </React.Fragment>
        );
    };

    const Display = ({ nameBus }) => {
        const [name] = useStateBusValue(nameBus);

        renderCount.display++;

        return <div id={'display'}>{name}</div>;
    };

    const Input = ({ nameBus }) => {
        const [setName] = useStateBusSetter(nameBus);

        renderCount.input++;

        return <input id={'input'} type={'text'} onChange={(e) => setName(e.target.value)} />;
    };

    const NoSubscriber = () => {
        renderCount.noSubscriber++;

        return <React.Fragment />;
    };

    const { container } = render(<App />);

    return {
        renderCount,
        getDisplay: () => container.querySelector('#display'),
        getInput: () => container.querySelector('#input'),
    };
};

const setupSubscriberAndUnsubscribe = () => {
    const nameBus = stateBus('john');

    const App = () => {
        const [toggle, setToggle] = useState(true);

        return (
            <React.Fragment>
                <button id={'toggle'} onClick={() => setToggle(!toggle)}>
                    toggle
                </button>
                {toggle && <Display />}
            </React.Fragment>
        );
    };

    const Display = () => {
        const [name] = useStateBusValue(nameBus);

        return <div id={'display'}>{name}</div>;
    };

    const { container } = render(<App />);

    return {
        nameBus,
        getToggle: () => container.querySelector('#toggle'),
        getDisplay: () => container.querySelector('#display'),
    };
};

const setupGetStateBusValues = () => {
    const nameBus = stateBus('john');
    const numberBus = stateBus(100);

    const App = () => {
        const [setName, setNumber] = useStateBusSetter(nameBus, numberBus);

        return (
            <button
                id={'change-values'}
                onClick={() => {
                    setName('tom');
                    setNumber(200);
                }}
            >
                change values
            </button>
        );
    };

    const { container } = render(<App />);

    return { nameBus, numberBus, getChangeValues: () => container.querySelector('#change-values') };
};

const setupSetStateBusValues = () => {
    const nameBus = stateBus('john');
    const numberBus = stateBus(100);

    const renderCount = { nameAndNumber: 0, nameOnly: 0 };

    const App = () => {
        return (
            <div>
                <NameAndNumber />
                <NameOnly />
            </div>
        );
    };

    const NameAndNumber = () => {
        const [name, number] = useStateBusValue(nameBus, numberBus);

        renderCount.nameAndNumber++;

        return (
            <div>
                {name} : {number}
            </div>
        );
    };

    const NameOnly = () => {
        const [name] = useStateBusValue(nameBus);

        renderCount.nameOnly++;

        return <div>{name}</div>;
    };

    const { container } = render(<App />);

    return { nameBus, numberBus, renderCount };
};

const setupMemoization = () => {
    const globalNameBus = stateBus('john');
    const renderCount = { app: 0 };

    const App = () => {
        const [, forceUpdate] = useState({});
        const [name] = useStateBusValue(globalNameBus);
        const [setName] = useStateBusSetter(globalNameBus);
        const localNameBus = useStateBus('tom');

        useEffect(() => {
            renderCount.app++;

            if (renderCount.app > 1) {
                return;
            }

            forceUpdate({});
        }, [name, setName, localNameBus, globalNameBus]);

        return <React.Fragment />;
    };

    const { container } = render(<App />);

    return { renderCount };
};

describe('stateBus', () => {
    it('구독한 컴포넌트만 렌더링 - global', () => {
        const { renderCount, getInput, getDisplay } = setupGlobalStateBus();

        expect(getDisplay()).toHaveTextContent('john');
        expect(renderCount).toEqual({ app: 1, input: 1, display: 1, noSubscriber: 1 });

        fireEvent.change(getInput(), { target: { value: 'test-1' } });
        fireEvent.change(getInput(), { target: { value: 'test-2' } });

        expect(getDisplay()).toHaveTextContent('test-2');
        expect(renderCount).toEqual({ app: 1, input: 1, display: 3, noSubscriber: 1 });
    });

    it('구독한 컴포넌트만 렌더링 - local', () => {
        const { renderCount, getInput, getDisplay } = setupLocalStateBus();

        expect(getDisplay()).toHaveTextContent('john');
        expect(renderCount).toEqual({ app: 1, input: 1, display: 1, noSubscriber: 1 });

        fireEvent.change(getInput(), { target: { value: 'test-1' } });
        fireEvent.change(getInput(), { target: { value: 'test-2' } });

        expect(getDisplay()).toHaveTextContent('test-2');
        expect(renderCount).toEqual({ app: 1, input: 1, display: 3, noSubscriber: 1 });
    });

    it('컴포넌트에서 useStateBusValue 사용시 구독 등록, 컴포넌트 unmount시 구독 해제', () => {
        const { nameBus, getDisplay, getToggle } = setupSubscriberAndUnsubscribe();

        expect(getDisplay()).toBeInTheDocument();
        expect(Object.values(nameBus.subscribers).length).toEqual(1);

        fireEvent.click(getToggle());

        expect(getDisplay()).not.toBeInTheDocument();
        expect(Object.values(nameBus.subscribers).length).toEqual(0);

        fireEvent.click(getToggle());

        expect(getDisplay()).toBeInTheDocument();
        expect(Object.values(nameBus.subscribers).length).toEqual(1);
    });

    it('getStateBusValues 기능 테스트', () => {
        const { nameBus, numberBus, getChangeValues } = setupGetStateBusValues();

        fireEvent.click(getChangeValues());

        expect(getStateBusValues(nameBus, numberBus)).toEqual(['tom', 200]);
    });

    it('setStateBusValues 기능 테스트', () => {
        const { nameBus, numberBus, renderCount } = setupSetStateBusValues();

        expect(renderCount).toEqual({ nameAndNumber: 1, nameOnly: 1 });

        setStateBusValues([nameBus, 'tom'], [numberBus, 200]);

        expect(renderCount).toEqual({ nameAndNumber: 2, nameOnly: 2 });
        expect(getStateBusValues(nameBus, numberBus)).toEqual(['tom', 200]);
    });

    it('올바르게 memoize 처리되는지 확인', () => {
        const { renderCount } = setupMemoization();

        expect(renderCount.app).toEqual(1);
    });
});
