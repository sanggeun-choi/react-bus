import { useEffect, useMemo, useRef, useState } from 'react';
import lodash from 'lodash';
import { Bus, context } from './react-bus-core';

class StateBus extends Bus {
    private initialState: any;
    private state: any;

    constructor(initialState: Object) {
        super();
        this.initialState = lodash.cloneDeep(initialState);
        this.state = lodash.cloneDeep(initialState);
    }

    private rerender(): void {
        Object.values(this.subscribers).forEach((subscriber: any) => subscriber.callback());
    }

    public setState(props: Object): void {
        this.state = { ...this.state, ...props };
    }

    public getState(): any {
        return this.state;
    }

    public reset(props: Object = {}): void {
        this.state = lodash.cloneDeep({ ...this.initialState, ...props });
        this.rerender();
    }

    public restore(newState: Object): void {
        this.state = lodash.cloneDeep(newState);
        this.rerender();
    }

    public dispatch(props: Function | Object): void {
        if (props instanceof Function) {
            props(this.state);
            this.setState({});
        }

        if (props instanceof Object) {
            this.setState(props);
        }

        this.rerender();
    }
}

export function createStateBus(initialState: Object): StateBus {
    return new StateBus(initialState);
}

export function useStateBusSelector(stateBus: StateBus, selector: Function = (state) => state): any {
    const [, forceUpdate] = useState({});
    const value = useRef(selector(stateBus.getState()));
    const subId = useMemo(() => `sub-${context.subId++}`, []);

    useEffect(() => {
        stateBus.subscribe(subId, () => {
            const nextValue = selector(stateBus.getState());

            if (value.current !== nextValue) {
                value.current = nextValue;
                forceUpdate({});
            }
        });

        return () => stateBus.unsubscribe(subId);
    }, [stateBus, subId, value]);

    return value.current;
}
