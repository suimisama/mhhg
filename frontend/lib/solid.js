/** ------------ 手写solid.js响应式数据，其实就是简单的发布订阅模式 ------------ **/

// 正在执行的副作用函数
const effects = []

/**
 * 创建响应式数据
 * @param {any} value 初始值
 * @description 返回getter()和setter()，其中：getter()只是返回signal的值，如果是在useEffect()里调用会多做一步——把副作用函数加入订阅；setter()改变signal的值并将所有订阅者执行一遍。
 * @returns {[Function, Function]}
 */
export function useSignal(value) {
    const signal = {
        value,
        subscribers: new Set()
    }
    function getter() {
        const effect = effects.at(-1)
        if (effect) signal.subscribers.add(effect)
        return signal.value
    }
    function setter(newValue) {
        if (signal.value === newValue) return
        signal.value = newValue
        signal.subscribers.forEach(subsciber => subsciber())
    }
    return [getter, setter]
}

/**
 * 创建副作用函数
 * @param {Function} fn
 * @description 立即执行回调函数，在用到的signal的getter()中会自动将该函数加入订阅，并在setter()时触发该函数。
 */
export function useEffect(fn) {
    function effect() {
        effects.push(effect)
        fn()
        effects.pop()
    }
    effect()
}

/**
 * 创建响应式数据，只在依赖值改变后重新计算
 * @param {Function} fn
 * @description useMemo = useSignal + useEffect.
 * @returns {any}
 */
export function useMemo(fn) {
    const [getValue, setValue] = useSignal()
    useEffect(() => {
        setValue(fn())
    })
    return getValue
}