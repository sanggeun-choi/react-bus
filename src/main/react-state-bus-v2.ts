import { useEffect, useMemo, useRef, useState } from 'react';
import lodash from 'lodash';

const context = { subId: 0 };

class StateBus {
    public initialState: any;
    public state: any;
    public subscribers: any;

    constructor(state) {
        this.initialState = lodash.cloneDeep(state);
        this.state = lodash.cloneDeep(state);
        this.subscribers = {};
    }

    private rerender(): void {
        Object.values(this.subscribers).forEach((subscriber: any) => subscriber.callback());
    }

    public reset(): void {
        this.state = lodash.cloneDeep(this.initialState);
        this.rerender();
    }

    public init(state: any): void {
        this.state = lodash.cloneDeep(state);
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

export function createStateBus(state: any): StateBus {
    return new StateBus(state);
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
