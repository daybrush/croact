import { addEvent, decamelize, getKeys, IObject, removeEvent } from "@daybrush/utils";
import { diff } from "@egjs/list-differ";
import { renderProviders } from "../renderProviders";
import { isDiff, splitProps, getAttributes, findContainerNode, removeNode } from "../utils";
import { Component } from "./Component";
import { Provider } from "./Provider";


function diffAttributes(attrs1: IObject<any>, attrs2: IObject<any>, el: Element) {
    const { added, removed, changed } = diffObject(getAttributes(attrs1), getAttributes(attrs2));
    for (const name in added) {
        el.setAttribute(name, added[name]);
    }
    for (const name in changed) {
        el.setAttribute(name, changed[name][1]);
    }
    for (const name in removed) {
        el.removeAttribute(name);
    }
}

function diffEvents(
    events1: IObject<any>,
    events2: IObject<any>,
    provier: ElementProvider,
) {
    const { added, removed, changed } = diffObject(events1, events2);

    for (const name in removed) {
        provier.re(name);
    }
    for (const name in added) {
        provier.ae(name, added[name]);
    }
    for (const name in changed) {
        provier.re(name);
        provier.ae(name, changed[name][1]);
    }
    for (const name in removed) {
        provier.re(name);
    }
}

function diffObject(a: object, b: object) {
    const keys1 = getKeys(a);
    const keys2 = getKeys(b);

    const result = diff(keys1, keys2, key => key);

    const added: IObject<any> = {};
    const removed: IObject<any> = {};
    const changed: IObject<any> = {};

    result.added.forEach(index => {
        const name = keys2[index];

        added[name] = b[name];
    });
    result.removed.forEach(index => {
        const name = keys1[index];

        removed[name] = a[name];
    });
    result.maintained.forEach(([index]) => {
        const name = keys1[index];
        const values = [a[name], b[name]];

        if (a[name] !== b[name]) {
            changed[name] = values;
        }
    });
    return {
        added,
        removed,
        changed,
    };
}

function diffStyle(style1: IObject<any>, style2: IObject<any>, el: HTMLElement | SVGElement) {
    const style = el.style;
    const { added, removed, changed } = diffObject(style1, style2);

    for (const beforeName in added) {
        const name = decamelize(beforeName, "-");

        style.setProperty(name, added[beforeName]);
    }
    for (const beforeName in changed) {
        const name = decamelize(beforeName, "-");

        style.setProperty(name, changed[beforeName][1]);
    }
    for (const beforeName in removed) {
        const name = decamelize(beforeName, "-");

        style.removeProperty(name);
    }
}


export class ElementProvider extends Provider<Element> {
    public events: IObject<Function> = {};
    public _isSVG = false;

    public ae(name, callback) {
        const events = this.events;

        events[name] = e => {
            e.nativeEvent = e;
            callback(e);
        };
        addEvent(this.base, name, events[name] as any);
    }
    public re(name) {
        const events = this.events;

        removeEvent(this.base, name, events[name] as any);

        delete events[name];
    }
    public _should(nextProps: any) {
        return isDiff(this.props, nextProps);
    }
    public _render(hooks: Function[], contextValues: Record<string, Component>, prevProps: any) {
        const self = this;
        const isMount = !self.base;

        if (isMount) {
            let isSVG = false;

            if (self._isSVG || self.type === "svg") {
                isSVG = true;
            } else {
                const containerNode = findContainerNode(self.container);

                isSVG = containerNode && (containerNode as any).ownerSVGElement;
            }

            self._isSVG = isSVG!;

            let element = self.props.portalContainer;

            if (!element) {
                const type = self.type;
                if (isSVG) {
                    element = document.createElementNS("http://www.w3.org/2000/svg", type);
                } else {
                    element = document.createElement(type);
                }
            }
            self.base = element;
        }
        renderProviders(this, this._ps, this.props.children, hooks, contextValues);
        const base = this.base;

        const {
            attributes: prevAttributes,
            events: prevEvents,
        } = splitProps(prevProps);
        const {
            attributes: nextAttributes,
            events: nextEvents,
        } = splitProps(this.props);

        diffAttributes(
            prevAttributes,
            nextAttributes,
            base,
        );
        diffEvents(
            prevEvents,
            nextEvents,
            this,
        );
        diffStyle(
            prevProps.style || {},
            this.props.style || {},
            base as HTMLElement,
        );
        hooks.push(() => {
            if (isMount) {
                this._mounted();
            } else {
                this._updated();
            }
        });
        return true;
    }
    public _unmount() {
        const events = this.events;
        const base = this.base;

        for (const name in events) {
            removeEvent(base, name, events[name] as any);
        }
        this._ps.forEach(provider => {
            provider._unmount();
        });
        this.events = {};

        if (!this.props.portalContainer) {
            removeNode(base);
        }
    }
}
