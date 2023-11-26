import htm from "./htm.js"



/** ------------ JSX -> VDOM -> DOM ------------ **/

// 类JSX模板字符串 -> VDOM
export const html = htm.bind((type, props, ...children) => ({ type, props, children }))

// VDOM -> DOM
function dom(vdom) {
    // 创建纯文字节点
    if (!vdom.type) return document.createTextNode(vdom.children)
    // 创建元素节点
    const dom = document.createElement(vdom.type)
    // 设置节点属性
    if (vdom.props) Object.entries(vdom.props).forEach(([key, value]) => { dom[key] = value })
    return dom
}



/** ------------ 安排渲染工作，在浏览器空闲时执行 ------------ **/

// 上次完成渲染的根节点，即当前页面上根节点的VDOM
let prevRoot = null

// 正在执行渲染工作的根节点
let nextRoot = null

// 下一个渲染工作，是nextRoot的引用
// 从nextRoot.child逐层往下，再由nextRoot.sibling逐层往上执行渲染工作
// 全部完成后就能绘制出最终的nextRoot，并将它递归挂载到页面
let nextWork = null

// 安排渲染工作
export function render(vdom, dom) {
    nextRoot = { dom, children: [vdom] }
    nextWork = nextRoot
}
// 空闲时接收渲染任务
requestIdleCallback(onWork)

// 准备渲染工作
function onWork(ddl) {
    let isFree = true
    // 有空闲时间、有渲染任务就一直执行
    while (isFree && nextWork) {
        nextWork = work(nextWork)
        isFree = ddl.timeRemaining()
    }
    // 本次渲染全部完成
    if (!nextWork && nextRoot) {
        worked(nextRoot.child)
        prevRoot = nextRoot
        nextRoot = null
    }
    // 等待下次空闲继续接收渲染任务
    requestIdleCallback(onWork)
}

// 执行渲染工作
// Fiber：纤程，Windows提出的概念，类似协程，比线程更小，可以被用户阻塞
// Fiber架构：React 16新技术，实现了异步、可中断的VDOM更新，解决了原先不可中断地递归更新VDOM导致的卡顿
function work(fiber) {
    // 创建DOM，完成本次渲染工作
    if (!fiber.dom) fiber.dom = dom(fiber)
    // 遍历子节点，准备下一个渲染工作
    if (Array.isArray(fiber.children)) {
        let prevSibling = null
        fiber.children.forEach((child, i) => {
            const newFiber = {
                type: child.type,
                props: child.props,
                parent: fiber,
                dom: null,
                children: child.children ?? child
            }
            if (i) prevSibling.sibling = newFiber
            else fiber.child = newFiber
            prevSibling = newFiber
        })
    }
    // 返回下一个渲染工作
    if (fiber.child) return fiber.child
    let nextFiber = fiber
    while (nextFiber) {
        if (nextFiber.sibling) return nextFiber.sibling
        nextFiber = nextFiber.parent
    }
}

// 将渲染完成的fiber tree挂载到真实DOM
function worked(fiber) {
    if (!fiber) return
    const parentDom = fiber.parent.dom
    parentDom.appendChild(fiber.dom)
    worked(fiber.child)
    worked(fiber.sibling)
}