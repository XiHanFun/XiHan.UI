// @vitest-environment jsdom
// useMachine 的 props 取值器：连接层每读一个 prop 都会走一遍，依赖没动时复用同一份展开结果。
//
// 失效面与组件自己的重渲一致：取值器读到的响应式来源一变就重算，读不到的（普通变量、
// 普通数组的长度）不会让它失效——那些来源本来也驱动不了 api 计算属性的重算。
import { buttonMachine, connectButton } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { computed, createApp, defineComponent, h, nextTick, ref } from 'vue'
import { vueNormalize } from '../src/runtime/normalize-props'
import { useMachine } from '../src/runtime/use-machine'

const disposers: Array<() => void> = []

afterEach(() => {
  while (disposers.length)
    disposers.pop()!()
  document.body.innerHTML = ''
})

interface Probe {
  calls: () => number
  disabled: ReturnType<typeof ref<boolean>>
  render: () => void
}

/** 挂一个按钮，数它的 props 取值器被求值了多少次。 */
function mount(): Probe {
  const disabled = ref(false)
  let calls = 0
  let force!: () => void
  const Probe = defineComponent({
    setup() {
      const bump = ref(0)
      force = () => {
        bump.value++
      }
      const service = useMachine(buttonMachine, () => {
        calls++
        return { disabled: disabled.value }
      })
      const api = computed(() => connectButton(service, vueNormalize))
      return () => h('button', { 'data-bump': bump.value, ...api.value.getRootProps() as Record<string, unknown> })
    },
  })
  const holder = document.createElement('div')
  document.body.append(holder)
  const app = createApp(Probe)
  disposers.push(() => app.unmount())
  app.mount(holder)
  return { calls: () => calls, disabled, render: force }
}

describe('useMachine 的 props 取值器', () => {
  it('一次连接里读多个 prop 只求值一次，响应式依赖不动时后续渲染也不重算', async () => {
    const probe = mount()
    const first = probe.calls()
    // connectButton 一次就读了 disabled / loading / iconOnly / size / variant / as / type 等七八个
    expect(first).toBeLessThan(4)

    probe.render()
    await nextTick()
    expect(probe.calls()).toBe(first)
  })

  it('取值器读到的响应式来源一变就重算', async () => {
    const probe = mount()
    const before = probe.calls()
    probe.disabled.value = true
    await nextTick()
    expect(probe.calls()).toBeGreaterThan(before)
    expect(document.querySelector('button')?.hasAttribute('disabled')).toBe(true)
  })
})
