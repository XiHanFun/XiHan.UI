// @vitest-environment jsdom
// useHotkeys 的三条：不渲染任何节点也能注册、监听挂在指定节点上且换节点会重绑、
// 作用域销毁后不再响应。三条锁的都是不报错的失败模式。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, ref } from 'vue'
import { useHotkeys, XhHotkeys } from '../src'

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

/** 挂一个只调组合式、不渲染内容的应用。 */
function mount(setup: () => void): () => void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => {
      setup()
      return () => null
    },
  })
  app.mount(host)
  const unmount = (): void => {
    app.unmount()
    host.remove()
  }
  cleanup.push(unmount)
  return unmount
}

function pressK(target: EventTarget): void {
  target.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'k',
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  }))
}

describe('useHotkeys', () => {
  it('不渲染任何节点也能注册：组合命中照样回调', () => {
    let hits = 0
    mount(() => {
      useHotkeys(() => ({
        keys: ['Control', 'k'],
        onHotKey: () => { hits += 1 },
      }))
    })
    pressK(document)
    expect(hits).toBe(1)
  })

  it('target 给自定义节点时监听挂在那个节点上，换了节点会解旧绑新', () => {
    const first = document.createElement('div')
    const second = document.createElement('div')
    document.body.append(first, second)
    const which = ref(first)
    let hits = 0
    mount(() => {
      useHotkeys(() => ({
        keys: ['Control', 'k'],
        target: () => which.value,
        onHotKey: () => { hits += 1 },
      }))
    })

    pressK(first)
    expect(hits).toBe(1)
    // 换节点前先确认旧节点是唯一的落点
    pressK(second)
    expect(hits).toBe(1)

    which.value = second
    return Promise.resolve().then(() => {
      pressK(second)
      expect(hits).toBe(2)
      // 旧节点必须已解绑，否则两处都会响应
      pressK(first)
      expect(hits).toBe(2)
    })
  })

  it('作用域销毁后不再响应', () => {
    let hits = 0
    const unmount = mount(() => {
      useHotkeys(() => ({
        keys: ['Control', 'k'],
        onHotKey: () => { hits += 1 },
      }))
    })
    pressK(document)
    expect(hits).toBe(1)

    unmount()
    pressK(document)
    expect(hits).toBe(1)
  })

  it('手动 stop 后即使响应式依赖变化也不会重新绑定', async () => {
    const enabled = ref(true)
    let hits = 0
    let stop = () => {}
    mount(() => {
      stop = useHotkeys(() => ({
        keys: ['Control', 'k'],
        enabled: enabled.value,
        onHotKey: () => { hits += 1 },
      })).stop
    })
    pressK(document)
    expect(hits).toBe(1)

    stop()
    enabled.value = false
    await Promise.resolve()
    enabled.value = true
    await Promise.resolve()
    pressK(document)
    expect(hits).toBe(1)
  })
})

describe('xhHotkeys', () => {
  it('组件只安装监听，不渲染展示节点', () => {
    let hits = 0
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      setup: () => () => h(XhHotkeys, {
        keys: ['Control', 'k'],
        onHotKey: () => { hits += 1 },
      }),
    })
    app.mount(host)
    cleanup.push(() => {
      app.unmount()
      host.remove()
    })

    // Vue 会为 null VNode 留一个内部注释锚点，但没有元素、文字或可访问节点。
    expect(host.children).toHaveLength(0)
    expect(host.textContent).toBe('')
    pressK(document)
    expect(hits).toBe(1)
  })
})
