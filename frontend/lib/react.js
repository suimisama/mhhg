import htm from "./htm.js"

/** ------------ 手写react元素渲染，使用htm代替babel，省去了编译环节 ------------ **/

/**
 * 模板字符串 -> VDOM
 */
export const html = htm.bind((type, props, ...children) => ({ type, props, children }))

/**
 * VDOM -> DOM
 * @param {Object|Array} vdom 由html()生成的虚拟DOM
 * @param {HTMLElement} parentDom 要挂载到的真实DOM
 */
export function render(vdom, parentDom) {
    if (Array.isArray(vdom)) return vdom.forEach(child => render(child, parentDom))

    let dom
    if (vdom.type) dom = document.createElement(vdom.type)
    else dom = document.createTextNode(vdom.children ?? vdom)

    if (vdom.props) Object.entries(vdom.props).forEach(([key, value]) => {
        if (key.startsWith("on") && typeof value === "function") dom.addEventListener(key.slice(2), value)
        else dom[key] = value
    })

    if (vdom.children) vdom.children.forEach(child => render(child, dom))
    parentDom.appendChild(dom)
}