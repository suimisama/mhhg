import { html, render } from "./lib/react.js"
import { useEffect, useMemo, useSignal } from "./lib/solid.js"

function App() {
    const [getCount, setCount] = useSignal(1)
    const getArea = useMemo(() => getCount() ** 2)

    useEffect(() => {
        console.log(getArea())
    })

    // TODO: 数据驱动视图
    return html`
        <h1 id="foo">Hello, world${"!".repeat(getCount())}</h1>
        <p id="bar">${getCount()}² = ${getArea()}</p>
        <button onclick=${() => setCount(getCount() + 1)}>+1</button>
    `
}

render(App(), document.body)