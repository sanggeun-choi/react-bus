import React, { useEffect, useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import {
    getStateBusFamilyValues,
    setStateBusFamilyValues,
    stateBusFamily,
    useStateBusFamily,
    useStateBusSetter,
    useStateBusValue,
} from '../main';

const setupGlobalStateBusFamily = () => {
    const renderCount = { app: 0, input: 0, display: 0, noSubscriber: 0 };
    const context = { values: {} };
    const userBusFamily = stateBusFamily({ name: 'john', number: 100 });

    const App = () => {
        renderCount.app++;

        return (
            <React.Fragment>
                <button id={'values'} onClick={() => (context.values = getStateBusFamilyValues(userBusFamily))}>
                    get values
                </button>
                <Display />
                <Input />
                <NoSubscriber />
            </React.Fragment>
        );
    };

    const Display = () => {
        const [name] = useStateBusValue(userBusFamily.name);

        renderCount.display++;

        return <div id={'display'}>{name}</div>;
    };

    const Input = () => {
        const [setName] = useStateBusSetter(userBusFamily.name);

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
        context,
        getDisplay: () => container.querySelector('#display'),
        getInput: () => container.querySelector('#input'),
        getValues: () => container.querySelector('#values'),
    };
};

const setupLocalStateBusFamily = () => {
    const renderCount = { app: 0, input: 0, display: 0, noSubscriber: 0 };
    const context = { values: {} };

    const App = () => {
        const userBusFamily = useStateBusFamily({ name: 'john', number: 100 });

        renderCount.app++;

        return (
            <React.Fragment>
                <button id={'values'} onClick={() => (context.values = getStateBusFamilyValues(userBusFamily))}>
                    get values
                </button>
                <Display userBusFamily={userBusFamily} />
                <Input userBusFamily={userBusFamily} />
                <NoSubscriber />
            </React.Fragment>
        );
    };

    const Display = ({ userBusFamily }) => {
        const [name] = useStateBusValue(userBusFamily.name);

        renderCount.display++;

        return <div id={'display'}>{name}</div>;
    };

    const Input = ({ userBusFamily }) => {
        const [setName] = useStateBusSetter(userBusFamily.name);

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
        context,
        getDisplay: () => container.querySelector('#display'),
        getInput: () => container.querySelector('#input'),
        getValues: () => container.querySelector('#values'),
    };
};

const setupGetStateBusValues = () => {
    const userStateBusFamily = stateBusFamily({
        name: 'john',
        number: 100,
    });

    const App = () => {
        const [setName, setNumber] = useStateBusSetter(userStateBusFamily.name, userStateBusFamily.number);

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

    return { userStateBusFamily, getChangeValues: () => container.querySelector('#change-values') };
};

const setupSetStateBusValues = () => {
    const userStateBusFamily = stateBusFamily({
        name: 'john',
        number: 100,
    });

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
        const [name, number] = useStateBusValue(userStateBusFamily.name, userStateBusFamily.number);

        renderCount.nameAndNumber++;

        return (
            <div>
                {name} : {number}
            </div>
        );
    };

    const NameOnly = () => {
        const [name] = useStateBusValue(userStateBusFamily.name);

        renderCount.nameOnly++;

        return <div>{name}</div>;
    };

    const { container } = render(<App />);

    return { userStateBusFamily, renderCount };
};

const setupMemoization = () => {
    const renderCount = { app: 0 };
    const globalBusFamily = stateBusFamily({
        name: 'john',
        number: 100,
    });

    const App = () => {
        const [, forceUpdate] = useState({});
        const localBusFamily = useStateBusFamily({
            name: 'john',
            number: 100,
        });

        useEffect(() => {
            renderCount.app++;

            if (renderCount.app > 1) {
                return;
            }

            forceUpdate({});
        }, [globalBusFamily, localBusFamily, getStateBusFamilyValues]);

        return <React.Fragment />;
    };

    const { container } = render(<App />);

    return { renderCount };
};

describe('stateBusFamily', () => {
    it('구독한 컴포넌트만 렌더링 - global', () => {
        const { renderCount, context, getDisplay, getInput, getValues } = setupGlobalStateBusFamily();

        expect(getDisplay()).toHaveTextContent('john');
        expect(renderCount).toEqual({ app: 1, input: 1, display: 1, noSubscriber: 1 });

        fireEvent.change(getInput(), { target: { value: 'test-1' } });
        fireEvent.change(getInput(), { target: { value: 'test-2' } });
        fireEvent.click(getValues());

        expect(getDisplay()).toHaveTextContent('test-2');
        expect(renderCount).toEqual({ app: 1, input: 1, display: 3, noSubscriber: 1 });
        expect(context.values).toEqual({ name: 'test-2', number: 100 });
    });

    it('구독한 컴포넌트만 렌더링 - local', () => {
        const { renderCount, context, getDisplay, getInput, getValues } = setupLocalStateBusFamily();

        expect(getDisplay()).toHaveTextContent('john');
        expect(renderCount).toEqual({ app: 1, input: 1, display: 1, noSubscriber: 1 });

        fireEvent.change(getInput(), { target: { value: 'test-1' } });
        fireEvent.change(getInput(), { target: { value: 'test-2' } });
        fireEvent.click(getValues());

        expect(getDisplay()).toHaveTextContent('test-2');
        expect(renderCount).toEqual({ app: 1, input: 1, display: 3, noSubscriber: 1 });
        expect(context.values).toEqual({ name: 'test-2', number: 100 });
    });

    it('getStateBusFamilyValues 기능 테스트', () => {
        const { userStateBusFamily, getChangeValues } = setupGetStateBusValues();

        fireEvent.click(getChangeValues());

        expect(getStateBusFamilyValues(userStateBusFamily)).toEqual({ name: 'tom', number: 200 });
    });

    it('setStateBusFamilyValues 기능 테스트', () => {
        const { userStateBusFamily, renderCount } = setupSetStateBusValues();

        expect(renderCount).toEqual({ nameAndNumber: 1, nameOnly: 1 });

        setStateBusFamilyValues(userStateBusFamily, { name: 'tom', number: 200 });

        expect(renderCount).toEqual({ nameAndNumber: 2, nameOnly: 2 });
        expect(getStateBusFamilyValues(userStateBusFamily)).toEqual({ name: 'tom', number: 200 });
    });

    it('올바르게 memoize 처리되는지 확인', () => {
        const { renderCount } = setupMemoization();

        expect(renderCount.app).toEqual(1);
    });
});
