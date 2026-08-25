// @vitest-environment jsdom
// 不可关闭的标签走不建机器的快路。这条验的是「快了但没变味」：
// 受控/非受控、setOpen、以及中途打开关闭钮，四件事都要与机器路逐条一致。
import type { App } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { useTagContext, XhTagCloseTrigger, XhTagLabel, XhTagRoot } from '../src'

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

interface Slot { open: boolean, setOpen: (v: boolean) => void }

/** Root 的默认插槽没有载荷，api 只能从上下文里取。 */
function makeProbe(onApi: (api: Slot) => void) {
  return defineComponent({
    name: 'TagProbe',
    setup() {
      const ctx = useTagContext()
      return () => {
        onApi({ open: ctx.api.value.open, setOpen: ctx.api.value.setOpen })
        return null
      }
    },
  })
}

function mount(props: Record<string, unknown>, listeners: Record<string, unknown> = {}) {
  const host = document.createElement('div')
  document.body.append(host)
  let payload!: Slot
  const Probe = makeProbe((api) => {
    payload = api
  })
  app = createApp({
    setup: () => () =>
      h(XhTagRoot, { ...props, ...listeners }, () => [
        h(XhTagLabel, () => '标签'),
        h(XhTagCloseTrigger),
        h(Probe),
      ]),
  })
  app.mount(host)
  return () => payload
}

function root(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="tag"][data-part="root"]')!
}

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
}

describe('标签的快路（不可关闭）', () => {
  it('缺省就是显示', async () => {
    mount({})
    await tick()
    expect(root().getAttribute('data-state')).toBe('open')
    expect(root().hasAttribute('hidden')).toBe(false)
  })

  it('defaultOpen=false 时初始即收起', async () => {
    mount({ defaultOpen: false })
    await tick()
    expect(root().getAttribute('data-state')).toBe('closed')
    expect(root().hasAttribute('hidden')).toBe(true)
  })

  it('非受控：setOpen 落内部值并通知', async () => {
    const onOpenChange = vi.fn()
    const slot = mount({}, { onOpenChange })
    await tick()

    slot().setOpen(false)
    await tick()
    expect(root().getAttribute('data-state')).toBe('closed')
    expect(onOpenChange).toHaveBeenCalledWith({ open: false })
  })

  it('受控：setOpen 只发意图，宿主不写回就不动', async () => {
    const onOpenChange = vi.fn()
    const slot = mount({ open: true }, { onOpenChange })
    await tick()

    slot().setOpen(false)
    await tick()
    expect(root().getAttribute('data-state')).toBe('open')
    expect(onOpenChange).toHaveBeenCalledWith({ open: false })
  })

  it('受控：宿主写回后跟着变', async () => {
    const open = ref(true)
    const host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      setup: () => () =>
        h(XhTagRoot, { open: open.value }, () => [h(XhTagLabel, () => '标签')]),
    })
    app.mount(host)
    await tick()
    expect(root().getAttribute('data-state')).toBe('open')

    open.value = false
    await tick()
    expect(root().getAttribute('data-state')).toBe('closed')
  })

  it('受控期间的 setOpen 不许偷偷落进内部值：转非受控后不能诈尸', async () => {
    // 受控时 props.open 恒盖过内部值，落没落进去从 DOM 上看不出来——
    // 直到宿主把 open 撤成 undefined 转回非受控，那个被偷偷写进去的值就冒出来了。
    // 机器路在这一刻是「保持原样」（syncOpen 遇 undefined 早退），快路必须一致
    const open = ref<boolean | undefined>(true)
    let api!: Slot
    const Probe = makeProbe((a) => {
      api = a
    })
    const host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      setup: () => () => h(XhTagRoot, { open: open.value }, () => [h(XhTagLabel, () => '标签'), h(Probe)]),
    })
    app.mount(host)
    await tick()

    api.setOpen(false)
    await tick()
    expect(root().getAttribute('data-state')).toBe('open')

    // 撤成非受控：该保持原样，而不是掉进刚才那次没生效的 false
    open.value = undefined
    await tick()
    expect(root().getAttribute('data-state')).toBe('open')
  })

  it('同值的 setOpen 不发意图', async () => {
    const onOpenChange = vi.fn()
    const slot = mount({}, { onOpenChange })
    await tick()

    slot().setOpen(true)
    await tick()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('挂载后才打开 closable：关闭钮照样能用，快路自己接得住', async () => {
    const closable = ref(false)
    const onOpenChange = vi.fn()
    const host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      setup: () => () =>
        h(XhTagRoot, { closable: closable.value, onOpenChange }, () => [
          h(XhTagLabel, () => '标签'),
          h(XhTagCloseTrigger),
        ]),
    })
    app.mount(host)
    await tick()

    closable.value = true
    await tick()
    const close = document.querySelector<HTMLElement>('[data-scope="tag"][data-part="close-trigger"]')!
    expect(close.hasAttribute('hidden')).toBe(false)

    close.click()
    await tick()
    expect(root().getAttribute('data-state')).toBe('closed')
    expect(onOpenChange).toHaveBeenCalledWith({ open: false })
  })
})
