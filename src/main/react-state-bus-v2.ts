import { useEffect, useMemo, useRef, useState } from 'react';
import lodash from 'lodash';
import { Bus, context } from './react-bus-core';

class StateBus extends Bus {
    public initialState: any;
    public state: any;

    constructor(initialState: Object) {
        super();
        this.initialState = lodash.cloneDeep(initialState);
        this.state = lodash.cloneDeep(initialState);
    }

    private rerender(): void {
        Object.values(this.subscribers).forEach((subscriber: any) => subscriber.callback());
    }

    public reset(): void {
        this.state = lodash.cloneDeep(this.initialState);
        this.rerender();
    }

    public restore(newState: Object): void {
        this.state = lodash.cloneDeep(newState);
        this.rerender();
    }

    public dispatch(props: Function | Object): void {
        if (props instanceof Function) {
            props(this.state);
            this.state = { ...this.state };
        }

        if (props instanceof Object) {
            this.state = { ...this.state, ...props };
        }

        this.rerender();
    }
}

export function createStateBus(initialState: Object): StateBus {
    return new StateBus(initialState);
}

export function useStateBusSelector(stateBus: StateBus, selector: Function): any {
    const [, forceUpdate] = useState({});
    const value = useRef(stateBus && selector(stateBus.state));
    const subId = useMemo(() => `sub-${context.subId++}`, []);

    useEffect(() => {
        stateBus.subscribe(subId, () => {
            const nextValue = selector(stateBus.state);

            if (value.current !== nextValue) {
                value.current = nextValue;
                forceUpdate({});
            }
        });

        return () => stateBus.unsubscribe(subId);
    }, [stateBus, subId, value]);

    return value.current;
}
