import { findIndex, getKeys, IObject } from "@daybrush/utils";
import { renderProviders } from "../renderProviders";
import { Context } from "../types";
import { fillProps, renderFunctionComponent } from "../utils";
import { Component } from "./Component";
import { Provider } from "./Provider";

export class ComponentProvider extends Provider<Component> {
    constructor(
        type: typeof Component,
        depth: number,
        key: string,
        index: number,
        container?: Provider | null,
        ref?: (e: Element | Component | Node | null) => any,
        props: IObject<any> = {},
    ) {
        super(type, depth, key, index, container, ref, fillProps(props, type.defaultProps));
    }
    public _should(nextProps: any, nextState: any) {
        return this.base.shouldComponentUpdate(
            fillProps(nextProps, this.type.defaultProps),
            nextState || this.base.state,
        ) !== false;
    }
    public _render(hooks: Function[], contexts: Record<string, Component>, prevProps: any) {
        const type: any = this.type;
        this.props = fillProps(this.props, this.type.defaultProps);

        const props = this.props;
        let base = this.base;
        const isMount = !this.base;
        

        this._cs = contexts;

        const contextType: Context = type.conextType;
        let contextValue!: any;
        let providerComponent!: Component;

        if (contextType) {
            const contextId = contextType.$_id;

            if (contextId in contexts) {
                providerComponent = contexts[contextId];
                contextValue = providerComponent.props.value;
            } else {
                contextValue = contextType.$_dv;
            }
        }
        if (isMount) {
            if (providerComponent) {
                providerComponent.$_subs.push(this);
            }
            if ("prototype" in type && type.prototype.render) {
                base = new type(this.props, contextValue);
            } else {
                base = new Component(props, contextValue);
                base.constructor = type;
                base.render = renderFunctionComponent;
            }
            base.$_provider = this;

            this.base = base;
        } else {
            base.props = this.props;
            base.context = contextValue;
        }
        const prevState = base.state;
        const template = base.render();

        if (template && template.props && !template.props.children.length) {
            template.props.children = this.props.children;
        }
        const nextContexts = {...contexts, ...base.$_ctxs };

        renderProviders(
            this,
            this._ps,
            template ? [template] : [],
            hooks,
            nextContexts,
        );
        hooks.push(() => {
            if (isMount) {
                this._mounted();
                base.componentDidMount();
            } else {
                this._updated();
                base.componentDidUpdate(prevProps, prevState);
            }
        });
    }
    public _setState(nextState?: IObject<any>) {
        const base = this.base;

        if (!base || !nextState) {
            return;
        }
        base.state = nextState;
    }
    public _unmount() {
        this._ps.forEach(provider => {
            provider._unmount();
        });
        const contexts = this._cs;
        const type = this.type;
        const contextType = type.contextType;

        if (contextType) {
            const context = contexts[contextType];

            if (context) {
                const subs = context.$_subs;
                const index = findIndex(subs, sub => sub === this);

                if (index > -1) {
                    subs.splice(index, 1);
                }
            }
        }
        clearTimeout(this.base.$_timer);
        this.base.componentWillUnmount();
    }
}