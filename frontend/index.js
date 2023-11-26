import { html, render } from "./lib/react.js"

const App = html`
    <div>
        <h1 id="foo"><a href="https://www.bilibili.com/">Hello, world.</a></h1>
        <h2 id="bar" style="color:gray">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</h2>
    </div>
`

// 挂载组件到页面
render(App, document.body)