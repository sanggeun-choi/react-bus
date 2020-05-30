import { useEffect, useRef } from 'react';

const useIsMounted = () => {
    const state = useRef({}).current;

    useEffect(() => {
        state.isMounted = true;
        return () => (state.isMounted = false);
    }, [state]);

    return { isMounted: () => !!state.isMounted };
};

export default useIsMounted;
