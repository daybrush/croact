import { Context } from "../types";
import { Component } from "./Component";

let i/*#__PURE__*/ = 0;

export function createContext(defaultValue?: any): Context {
    const id = `c${++i}`;

    function Provider(this: Component, props: any) {
        if (!this.$_ctxs) {
            const $_ctxs = { [id]: this };
            const $_subs = [];

            this.shouldComponentUpdate = (nextProps) => {
                if (nextProps.value !== this.props.value) {
                    // request
                    this.$_req = true;
                }
            }
            this.$_subs = $_subs;
            this.$_ctxs = $_ctxs;
        }
    }
    function Consumer(props, contextValue) {
        return props.children(contextValue);
    }

    const context = {
        $_id: id,
        $_dv: defaultValue,
        Consumer,
        Provider: Provider,
    };

    Consumer.contextType = context;

    return context;
}