// @vitest-environment jsdom
// transfer 两颗搬运钮的可访问名能不能改：一条走实例 prop，一条走全局配置。
//
// 这两颗钮默认是空按钮——箭头由皮肤画在伪元素上，伪元素进不了可及树——
// 而它们是本组件唯一的操作出口，名字缺席等于整个组件对读屏不可用。
//
// 全局那条单独立判据：跑机器的组件只经 useMachine 并了 locale 与 size，
// translations 按组件名分桶、只有 withXhConfig 认得出自己是谁，漏了它就是「配了没生效」。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { provideXhConfig, XhTransferRoot, XhTransferToSourceTrigger, XhTransferToTargetTrigger } from '../src'

const ITEMS = [
  { value: 'a', label: '甲' },
  { value: 'b', label: '乙' },
]

afterEach(() => {
  document.body.innerHTML = ''
})

function mount(render: () => unknown) {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({ render })
  app.mount(host)
  const nameOf = (part: string): string | null =>
    host.querySelector<HTMLElement>(`[data-part="${part}"]`)?.getAttribute('aria-label') ?? null
  const done = (): void => {
    app.unmount()
    host.remove()
  }
  return { nameOf, done }
}

/** 外面裹一层供了全局配置的宿主。 */
function mountWithConfig(config: Record<string, unknown>, render: () => unknown) {
  return mount(() => h({
    setup() {
      provideXhConfig(config as never)
      return () => render()
    },
  }))
}

function transfer(props: Record<string, unknown> = {}): unknown {
  return h(XhTransferRoot, { collection: ITEMS, ...props }, () => [
    h(XhTransferToTargetTrigger),
    h(XhTransferToSourceTrigger),
  ])
}

describe('transfer 搬运钮的可访问名', () => {
  it('缺省是英文，两颗各有各的名字', () => {
    const { nameOf, done } = mount(() => transfer())
    expect(nameOf('to-target-trigger')).toBe('Move to target list')
    expect(nameOf('to-source-trigger')).toBe('Move to source list')
    done()
  })

  it('实例上的 translations 改得动', () => {
    const { nameOf, done } = mount(() => transfer({
      translations: { toTarget: '搬到已选', toSource: '搬回备选' },
    }))
    expect(nameOf('to-target-trigger')).toBe('搬到已选')
    expect(nameOf('to-source-trigger')).toBe('搬回备选')
    done()
  })

  it('全局配置里按组件名分桶的那份也到得了', () => {
    const { nameOf, done } = mountWithConfig(
      { translations: { transfer: { toTarget: '全局向右' } } },
      () => transfer(),
    )
    expect(nameOf('to-target-trigger')).toBe('全局向右')
    // 没配到的那一句仍走兜底，不会被整桶顶掉
    expect(nameOf('to-source-trigger')).toBe('Move to source list')
    done()
  })

  it('实例上的那份压得过全局', () => {
    const { nameOf, done } = mountWithConfig(
      { translations: { transfer: { toTarget: '全局向右' } } },
      () => transfer({ translations: { toTarget: '实例向右' } }),
    )
    expect(nameOf('to-target-trigger')).toBe('实例向右')
    done()
  })
})
