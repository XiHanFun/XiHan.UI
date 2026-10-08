// @vitest-environment jsdom
import type { SpinnerProps } from '../src/spinner'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
// 直接指到组件目录：包主入口的导出由接线一并补，测试不等它
import { connectSpinner, SPINNER_DEFAULT_LABEL, spinnerAnatomy, spinnerMachine, spinnerMeta } from '../src/spinner'

type Dict = Record<string, unknown>

function make(initial: SpinnerProps = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<SpinnerProps>(initial)
  const service = createService(spinnerMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    api: () => connectSpinner(service, normalizeProps),
    setProps: (next: Partial<SpinnerProps>) => props.set(prev => ({ ...prev, ...next })),
    stop: () => runtime.stop(),
  }
}

function api(props: SpinnerProps = {}) {
  return make(props).api()
}

function root(props: SpinnerProps = {}): Dict {
  return api(props).getRootProps() as Dict
}

describe('spinner 解剖', () => {
  it('两个部件：活区容器与可选的可见文案节点，只有 root 是必需的', () => {
    expect(spinnerAnatomy.build().root.attrs).toEqual({ 'data-scope': 'spinner', 'data-part': 'root', 'class': 'xh-scope-spinner' })
    expect(spinnerMeta.requiredParts).toEqual(['root'])
  })
})

describe('connectSpinner 活区语义', () => {
  it('root 是 status 活区，礼貌级别显式写成 polite', () => {
    const attrs = root()
    expect(attrs['data-scope']).toBe('spinner')
    expect(attrs['data-part']).toBe('root')
    expect(attrs.role).toBe('status')
    // status 隐含 polite，但没实现隐含映射的读屏只认显式声明
    expect(attrs['aria-live']).toBe('polite')
  })

  it('任何情况下都有可及名字：转圈本身读不出任何内容，缺了名字读屏只报出"有个 status 区域"', () => {
    expect(root()['aria-label']).toBe(SPINNER_DEFAULT_LABEL)
    // 属性写成 label / label="" 时取到的就是空串，认了它活区就成了没名字的空壳
    expect(root({ label: '' })['aria-label']).toBe(SPINNER_DEFAULT_LABEL)
    expect(root({ label: '   ' })['aria-label']).toBe(SPINNER_DEFAULT_LABEL)
    // 空文案只是这一处没给，语言包的默认值仍该顶上
    expect(root({ label: '', translations: { label: '加载中' } })['aria-label']).toBe('加载中')
  })
})

describe('connectSpinner 文案解析', () => {
  it('优先级：label → translations.label → 内置默认值', () => {
    expect(root({ label: '正在上传' })['aria-label']).toBe('正在上传')
    expect(root({ translations: { label: '加载中' } })['aria-label']).toBe('加载中')
    expect(root({ label: '正在上传', translations: { label: '加载中' } })['aria-label']).toBe('正在上传')
    expect(root()['aria-label']).toBe(SPINNER_DEFAULT_LABEL)
  })

  it('解析结果一并交给宿主：可见文案节点照它渲染，看到的与念到的才是同一段字', () => {
    expect(api({ label: '正在上传' }).label).toBe('正在上传')
    expect(api({ translations: { label: '加载中' } }).label).toBe('加载中')
    expect(api().label).toBe(SPINNER_DEFAULT_LABEL)
    // aria-label 与它逐字相同，不存在第二处事实源
    expect(root({ label: '正在上传' })['aria-label']).toBe(api({ label: '正在上传' }).label)
  })

  it('空的 translations 对象不算给过文案', () => {
    expect(root({ translations: {} })['aria-label']).toBe(SPINNER_DEFAULT_LABEL)
  })
})

describe('connectSpinner 尺寸', () => {
  it('缺省档不写 data-size：皮肤的基础规则就是缺省档', () => {
    expect(root()['data-size']).toBeUndefined()
  })

  it('给了档位就原样写出去', () => {
    expect(root({ size: 'sm' })['data-size']).toBe('sm')
    expect(root({ size: 'md' })['data-size']).toBe('md')
    expect(root({ size: 'lg' })['data-size']).toBe('lg')
  })
})

describe('connectSpinner 排布', () => {
  it('不写排布时显式落 horizontal：转圈与配文并排', () => {
    expect(root()['data-orientation']).toBe('horizontal')
  })

  it('vertical 原样写出：转圈在上、配文在下', () => {
    expect(root({ orientation: 'vertical' })['data-orientation']).toBe('vertical')
  })
})

describe('connectSpinner 文案节点', () => {
  it('label 部件只带身份标记：内容是作者的，角色与活区都在 root 上', () => {
    expect(api().getLabelProps()).toEqual({ 'data-scope': 'spinner', 'data-part': 'label', 'class': 'xh-scope-spinner' })
  })
})

describe('spinner 露面前的等待', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('不写 delay、写 0、负数或非有限数都即刻露面', () => {
    for (const delay of [undefined, 0, -100, Number.NaN, Number.POSITIVE_INFINITY]) {
      const t = make({ delay })
      expect(t.api().visible).toBe(true)
      expect(t.api().getRootProps()).toMatchObject({ 'data-state': 'visible' })
    }
  })

  it('等够 delay 才露面：之前 data-state 为 hidden，活区语义与可及名照旧', () => {
    vi.useFakeTimers()
    const t = make({ delay: 300, label: '正在加载' })
    expect(t.api().visible).toBe(false)
    expect(t.api().getRootProps()).toMatchObject({ 'data-state': 'hidden', 'role': 'status', 'aria-label': '正在加载' })
    vi.advanceTimersByTime(299)
    expect(t.api().visible).toBe(false)
    vi.advanceTimersByTime(1)
    expect(t.api().visible).toBe(true)
    expect(t.api().getRootProps()).toMatchObject({ 'data-state': 'visible' })
  })

  it('等待途中停机（宿主卸掉转圈）：计时器随之撤掉，不再露面', () => {
    vi.useFakeTimers()
    const t = make({ delay: 300 })
    t.stop()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('等待途中把 delay 改成 0 即刻露面；露面之后再改 delay 不回到等待', () => {
    vi.useFakeTimers()
    const t = make({ delay: 1000 })
    t.setProps({ delay: 0 })
    expect(t.api().visible).toBe(true)
    t.setProps({ delay: 500 })
    expect(t.api().visible).toBe(true)
    vi.advanceTimersByTime(1000)
    expect(t.api().visible).toBe(true)
  })
})
