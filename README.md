## ⚙️ Installation
### npm
```bash
$ npm install croact
```

## No supported
* Context
* Hooks
* Fragments

## 🚀 How to use
Alias react, react-dom to croact


* Rollup
```js
import reactCompat from "rollup-plugin-react-compat";

const reactPlugin = reactCompat({
    useReactCompat: true,
    resolveCompat: true,
});

```