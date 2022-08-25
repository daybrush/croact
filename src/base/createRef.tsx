export function createRef(defaultValue: any) {
    const refCallback = (e: any) => {
        refCallback.current = e; 
    };
    refCallback.current = defaultValue;

    return refCallback;
}