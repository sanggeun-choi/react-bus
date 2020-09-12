import { useEffect, useMemo, useRef, useState } from 'react';
import lodash from 'lodash';

const context = { subId: 0 };

class StateBus {
    public initialState: any;
    public state: any;
    public subscribers: any;

    constructor(initialState: Object) {
        this.initialState = lodash.cloneDeep(initialState);
        this.state = lodash.cloneDeep(initialState);
        this.subscribers = {};
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
        stateBus.subscribers[subId] = {
            callback: () => {
                const nextValue = selector(stateBus.state);

                if (value.current !== nextValue) {
                    value.current = nextValue;
                    forceUpdate({});
                }
            },
        };

        return () => delete stateBus.subscribers[subId];
    }, [stateBus, subId, value]);

    return value.current;
}
