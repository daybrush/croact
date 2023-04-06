
Alias `react`, `react-dom` to `croact`

It also supports `react`'s lightweight modules and additional features to support react's components to other frameworks.

## ⚙️ Installation
### npm
```bash
$ npm install croact
```

## No supported
* Fragment


## Used Components
* `Moveable`: https://github.com/daybrush/moveable
* `Guides`: https://github.com/daybrush/guides
* `Ruler`: https://github.com/daybrush/ruler



## 🚀 How to use
* self render
```html
<div>Self</div>
```

```jsx
import { renderSelf } from "croact";


renderSelf(<div>Self</div>, document.querySelector("div"));

```
* Rollup
```js
import reactCompat from "rollup-plugin-react-compat";

const reactPlugin = reactCompat({
    useCroact: true,
    resolveCompat: true,
});

```
