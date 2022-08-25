import { IObject, isArray, isUndefined } from "@daybrush/utils";
import { Component } from "./base/Component";
import { Provider } from "./base/Provider";
import { CompatElement } from "./types";


export function fillKeys(keys: any[]): string[] {
    let index = 0;

    return keys.map(key => key == null ? `$compat${++index}` : `${key}`);
}


export function flat(arr: any[]): any[] {
    let arr2 = [];

    arr.forEach(el => {
        arr2 = arr2.concat(isArray(el) ? flat(el) : el);
    });

    return arr2;
}

export function fillProps(props: IObject<any>, defaultProps?: IObject<any>) {
    if (!defaultProps) {
        return props;
    }
    for (const name in defaultProps) {
        if (isUndefined(props[name])) {
            props[name] = defaultProps[name];
        }
    }
    return props;
}

export function isDiff(a: object, b: object) {
    if (a === b) { return false; }
    for (const i in a) {
        if (!(i in b)) {
            return true;
        }
    }
    for (const i in b) {
        if (a[i] !== b[i]) {
            return true;
        }
    }
    return false;
}



export function getAttributes(props: IObject<any>) {
    const { className, ...otherProps } = props;

    if (className != null) {
        otherProps.class = className;
    }
    delete otherProps.style;
    delete otherProps.children;
    return otherProps;
}

export function splitProps(props: IObject<any>) {
    const attributes: Record<string, any> = {};
    const events: Record<string, any> = {};

    for (const name in props) {
        if (name.indexOf("on") === 0) {
            events[name.replace("on", "").toLowerCase()] = props[name];
        } else {
            attributes[name] = props[name];
        }
    }
    return {
        attributes,
        events,
    };
}


export function findContainerNode(provider?: Provider | null): Node | null {
    if (!provider) {
        return null;
    }
    const base = provider.base;
    if (base instanceof Node) {
        return base;
    }
    return findContainerNode(provider.container);
}

export function findDOMNode(comp: Component | Node | null): Node | null {
    if (!comp || comp instanceof Node) {
        return comp as Node | null;
    }
    const providers = comp.$_p._ps;

    if (!providers.length) {
        return null;
    }
    return findDOMNode(providers[0].base);
}


export function createElement(
    type: any,
    props: any,
    ...children: any[]
): CompatElement {
    const { key, ref, ...otherProps } = props || {};

    return {
        type,
        key,
        ref,
        props: { ...otherProps, children: flat(children).filter(child => child != null && child !== false) },
    };
}

export function removeNode(node: Node) {
	const parentNode = node.parentNode;

	if (parentNode) {
        parentNode.removeChild(node);
    }
}

export function executeHooks(hooks: Function[]) {
    hooks.forEach(hook => {
        hook();
    });
}

export function renderFunctionComponent(this: Component) {
    return this.constructor(this.props, this.context);
}
