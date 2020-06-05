import React, { useEffect, useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { getStateBusFamilyValues, stateBusFamily, useStateBusFamily, useStateBusSetter, useStateBusValue } from '../main';

const setup = () => {
    const renderCount = { displayName: 0, inputName: 0, noSubscriber: 0 };
    const context = { values: {} };

    const App = () => {
        const userBusFamily = useStateBusFamily({
            name: 'john',
            number: 100,
        });

        return (
            <React.Fragment>
                <button
                    id={'values-button'}
                    onClick={() => {
                        context.values = getStateBusFamilyValues(userBusFamily);
                    }}
                >
                    get values
                </button>
                <DisplayName renderCount={renderCount} userBusFamily={userBusFamily} />
                <InputName renderCount={renderCount} userBusFamily={userBusFamily} />
                <NoSubscriber renderCount={renderCount} />
            </React.Fragment>
        );
    };

    const DisplayName = ({ renderCount, userBusFamily }) => {
        const name = useStateBusValue(userBusFamily.name);

        renderCount.displayName++;

        return <div id={'display-name'}>{name}</div>;
    };

    const InputName = ({ renderCount, userBusFamily }) => {
        const setName = useStateBusSetter(userBusFamily.name);

        renderCount.inputName++;

        return (
            <div>
                <input id={'input-name'} type={'text'} onChange={(e) => setName(e.target.value)} />
            </div>
        );
    };

    const NoSubscriber = ({ renderCount }) => {
        renderCount.noSubscriber++;

        return <div>NoSubscriber</div>;
    };

    const { container } = render(<App />);

    return {
        renderCount,
        context,
        getValuesButton: () => container.querySelector('#values-button'),
        getInputName: () => container.querySelector('#input-name'),
        getDisplayName: () => container.querySelector('#display-name'),
    };
};

const setup2 = () => {
    const renderCount = { app: 0 };

    const App = () => {
        const [, forceUpdate] = useState({});
        const userBusFamily = useStateBusFamily({
            name: 'john',
            number: 100,
        });

        useEffect(() => {
            renderCount.app++;

            if (renderCount.app > 2) {
                return;
            }

            forceUpdate({});
        }, [userBusFamily, getStateBusFamilyValues]);

        return <React.Fragment />;
    };

    render(<App />);

    return { renderCount };
};

describe('stateBusFamily', () => {
    it('구독한 컴포넌트만 렌더링', () => {
        const { renderCount, context, getValuesButton, getInputName, getDisplayName } = setup();

        expect(getDisplayName()).toHaveTextContent('john');
        expect(renderCount).toEqual({ inputName: 1, displayName: 1, noSubscriber: 1 });

        fireEvent.change(getInputName(), { target: { value: 'test-1' } });
        fireEvent.change(getInputName(), { target: { value: 'test-2' } });
        fireEvent.click(getValuesButton());

        expect(getDisplayName()).toHaveTextContent('test-2');
        expect(renderCount).toEqual({ inputName: 1, displayName: 3, noSubscriber: 1 });
        expect(context.values).toEqual({ name: 'test-2', number: 100 });
    });

    it('올바르게 memoize 처리되는지 확인', () => {
        const { renderCount } = setup2();

        expect(renderCount.app).toEqual(1);
    });
});
