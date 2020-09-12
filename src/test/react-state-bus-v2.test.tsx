import React, { useEffect, useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { createStateBus, useStateBusSelector } from '../main';

const setupRenderSubscriberOnlyTest = () => {
    const stateBus = createStateBus({ name: 'john' });
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
        const name = useStateBusSelector(stateBus, (state) => state.name);

        renderCount.display++;

        return <div id={'display'}>{name}</div>;
    };

    const Input = () => {
        renderCount.input++;

        return <input id={'input'} type={'text'} onChange={(e) => stateBus.dispatch((state) => (state.name = e.target.value))} />;
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
    const stateBus = createStateBus({ name: 'john' });

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
        const name = useStateBusSelector(stateBus, (state) => state.name);

        return <div id={'display'}>{name}</div>;
    };

    const { container } = render(<App />);

    return {
        stateBus,
        getToggle: () => container.querySelector('#toggle'),
        getDisplay: () => container.querySelector('#display'),
    };
};

const setupRootStateImmutableTest = () => {
    const stateBus = createStateBus({ number: 1 });
    const renderCount = { app: 0 };

    const App = () => {
        const state = useStateBusSelector(stateBus, (state) => state);

        renderCount.app++;

        return (
            <button id={'up'} onClick={() => stateBus.dispatch((state) => state.number++)}>
                change state
            </button>
        );
    };

    const { container } = render(<App />);

    return {
        stateBus,
        renderCount,
        getUpButton: () => container.querySelector('#up'),
    };
};

const setupMemoization = () => {
    const stateBus = createStateBus({ name: 'john' });
    const renderCount = { app: 0 };

    const App = () => {
        const [, forceUpdate] = useState({});
        const name = useStateBusSelector(stateBus, (state) => state.name);

        useEffect(() => {
            renderCount.app++;

            if (renderCount.app > 1) {
                return;
            }

            forceUpdate({});
        }, [name, stateBus]);

        return <React.Fragment />;
    };

    const { container } = render(<App />);

    return { renderCount };
};

describe('stateBus', () => {
    it('구독한 컴포넌트만 렌더링', () => {
        const { renderCount, getInput, getDisplay } = setupRenderSubscriberOnlyTest();

        expect(getDisplay()).toHaveTextContent('john');
        expect(renderCount).toEqual({ app: 1, input: 1, display: 1, noSubscriber: 1 });

        fireEvent.change(getInput(), { target: { value: 'test-1' } });
        fireEvent.change(getInput(), { target: { value: 'test-2' } });

        expect(getDisplay()).toHaveTextContent('test-2');
        expect(renderCount).toEqual({ app: 1, input: 1, display: 3, noSubscriber: 1 });
    });

    it('subscribe, unsubscribe 테스트', () => {
        const { stateBus, getDisplay, getToggle } = setupSubscriberAndUnsubscribe();

        expect(getDisplay()).toBeInTheDocument();
        expect(Object.values(stateBus.subscribers).length).toEqual(1);

        fireEvent.click(getToggle());

        expect(getDisplay()).not.toBeInTheDocument();
        expect(Object.values(stateBus.subscribers).length).toEqual(0);

        fireEvent.click(getToggle());

        expect(getDisplay()).toBeInTheDocument();
        expect(Object.values(stateBus.subscribers).length).toEqual(1);
    });

    it('root state immutable 테스트', () => {
        const { stateBus, renderCount, getUpButton } = setupRootStateImmutableTest();

        expect(1).toEqual(stateBus.state.number);
        expect(1).toEqual(renderCount.app);

        fireEvent.click(getUpButton());
        fireEvent.click(getUpButton());

        expect(3).toEqual(stateBus.state.number);
        expect(3).toEqual(renderCount.app);
    });

    it('memoization 테스트', () => {
        const { renderCount } = setupMemoization();

        expect(renderCount.app).toEqual(1);
    });

    it('dispatch 테스트', () => {
        const stateBus = createStateBus({ name: 'john', number: 0 });

        expect('john').toEqual(stateBus.state.name);
        expect(0).toEqual(stateBus.state.number);

        stateBus.dispatch((state) => (state.name = 'tom'));
        stateBus.dispatch((state) => (state.number = 1));

        expect('tom').toEqual(stateBus.state.name);
        expect(1).toEqual(stateBus.state.number);

        stateBus.dispatch({ name: 'jane' });
        stateBus.dispatch({ number: 2 });

        expect('jane').toEqual(stateBus.state.name);
        expect(2).toEqual(stateBus.state.number);
    });

    it('get state 테스트', () => {
        const stateBus = createStateBus({ name: 'john', number: 0 });

        expect('john').toEqual(stateBus.state.name);
        expect(0).toEqual(stateBus.state.number);

        stateBus.dispatch((state) => state.number++);
        stateBus.dispatch((state) => state.number++);

        expect('john').toEqual(stateBus.state.name);
        expect(2).toEqual(stateBus.state.number);
    });

    it('reset 테스트', () => {
        const stateBus = createStateBus({ name: 'john', number: 0 });

        expect('john').toEqual(stateBus.state.name);
        expect(0).toEqual(stateBus.state.number);

        stateBus.dispatch((state) => (state.name = 'tom'));
        stateBus.dispatch((state) => (state.number = 1));

        expect('tom').toEqual(stateBus.state.name);
        expect(1).toEqual(stateBus.state.number);

        stateBus.reset();

        expect('john').toEqual(stateBus.state.name);
        expect(0).toEqual(stateBus.state.number);
    });

    it('restore 테스트', () => {
        const stateBus = createStateBus({ name: 'john', number: 0 });

        expect('john').toEqual(stateBus.state.name);
        expect(0).toEqual(stateBus.state.number);

        stateBus.restore({ name: 'tom', number: 1 });

        expect('tom').toEqual(stateBus.state.name);
        expect(1).toEqual(stateBus.state.number);
    });
});
