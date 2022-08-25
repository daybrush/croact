import { ContainerProvider } from "../providers";
import { renderProvider } from "../renderProviders";
import { createElement } from "../utils";
import { PureComponent } from "./Component";
import { Provider } from "./Provider";

class Portal extends PureComponent {
    public _portalProvider: Provider | null = null;
    public componentDidMount() {
        const { element, container } = this.props;

        const parentProvider = this.$_provider;
        this._portalProvider = new ContainerProvider(container, parentProvider.depth + 1);

        renderProvider(element, container, this._portalProvider, parentProvider._cs);
    }
    public componentDidUpdate() {
        const { element, container } = this.props;

        renderProvider(element, container, this._portalProvider, this.$_provider._cs);
    }
    public componentWillUnmount() {
        const { container } = this.props;

        renderProvider(null, container, this._portalProvider, this.$_provider._cs);
        this._portalProvider = null;
    }
}


export function createPortal(el: any, container: Element) {
    return createElement(Portal, { element: el, container });
}