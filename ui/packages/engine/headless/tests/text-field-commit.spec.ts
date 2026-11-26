import type { TextFieldSchema, TextFieldValueCommitDetails } from '../src/text-field/index'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { connectTextField, textFieldMachine, textFieldStructure } from '../src/text-field/index'

type Props = TextFieldSchema['props']
type Dict = Record<string, unknown>

function makeField(initial: Props = {}) {
  const commits: TextFieldValueCommitDetails[] = []
  const props: Props = { ...initial, onValueCommit: d => commits.push(d) }
  const runtime = createVanillaRuntime()
  const service = createService(textFieldMachine, { props: () => ({ ...props }), runtime })
  runtime.start()
  const api = () => connectTextField(service, normalizeProps)
  return {
    commits,
    api,
    setProps: (next: Props) => Object.assign(props, next),
    type: (text: string) => service.send({ type: 'VALUE.SET', value: text }),
    /** 在输入框上按一个键；返回缺省行为有没有被拦下。 */
    press: (key: string, extra: Dict = {}, as: 'input' | 'textarea' = 'input') => {
      const event = { key, ctrlKey: false, metaKey: false, altKey: false, repeat: false, isComposing: false, keyCode: 0, preventDefault: vi.fn(), ...extra }
      ;(api().getInputProps({ as }).onKeyDown as (e: unknown) => void)(event)
      return event.preventDefault.mock.calls.length > 0
    },
  }
}

describe('text-field 回车提交', () => {
  it('单行输入框里按回车发出 onValueCommit，带当前值；不拦缺省行为', () => {
    const f = makeField()
    f.type('xihan')
    const prevented = f.press('Enter')
    expect(f.commits).toEqual([{ value: 'xihan' }])
    // 放在表单里仍要触发隐式提交
    expect(prevented).toBe(false)
  })

  it('空值也照发：搜索框按回车可以是「搜全部」', () => {
    const f = makeField()
    f.press('Enter')
    expect(f.commits).toEqual([{ value: '' }])
  })

  it('输入法组合期间的回车是在选字，不算提交', () => {
    const f = makeField()
    f.type('pinyin')
    f.press('Enter', { isComposing: true })
    f.press('Enter', { keyCode: 229 })
    expect(f.commits).toEqual([])
  })

  it('组合起止之间的回车同样不算：React 的合成键盘事件不带 isComposing，靠组合事件记下的这一段兜住', () => {
    const f = makeField()
    const el = { value: 'pin' }
    const props = f.api().getInputProps() as Dict
    ;(props.onCompositionStart as (e: unknown) => void)({ currentTarget: el })
    f.press('Enter', { currentTarget: el })
    expect(f.commits).toEqual([])
    ;(props.onCompositionEnd as (e: unknown) => void)({ currentTarget: el })
    f.press('Enter', { currentTarget: el })
    expect(f.commits).toEqual([{ value: 'pin' }])
  })

  it('多行宿主里回车是换行，不发', () => {
    const f = makeField()
    f.type('第一行')
    f.press('Enter', {}, 'textarea')
    expect(f.commits).toEqual([])
  })

  it('禁用、只读、带修饰键与按住不放的连发都不发', () => {
    const f = makeField({ defaultValue: 'a' })
    f.press('Enter', { repeat: true })
    f.press('Enter', { ctrlKey: true })
    f.press('Enter', { metaKey: true })
    f.setProps({ readOnly: true })
    f.press('Enter')
    f.setProps({ readOnly: false, disabled: true })
    f.press('Enter')
    expect(f.commits).toEqual([])
  })

  it('写了 mask 时另带去掉分隔符的值', () => {
    const f = makeField({ mask: '999 9999' })
    f.type('1381234')
    f.press('Enter')
    expect(f.commits).toEqual([{ value: '138 1234', unmaskedValue: '1381234' }])
  })

  it('escape 清空照旧，不发提交', () => {
    const f = makeField({ clearable: true, defaultValue: 'a' })
    expect(f.press('Escape')).toBe(true)
    expect(f.api().value).toBe('')
    expect(f.commits).toEqual([])
  })
})

describe('text-field 在途', () => {
  it('缺省不在途：loading 部件收起，输入框不报 aria-busy', () => {
    const api = makeField().api()
    expect(api.loading).toBe(false)
    expect(api.getLoadingProps()).toMatchObject({ 'hidden': true, 'aria-hidden': true, 'data-xh-loading-ring': '' })
    expect((api.getInputProps() as Dict)['aria-busy']).toBeUndefined()
    expect((api.getRootProps() as Dict)['data-loading']).toBeUndefined()
  })

  it('在途：输入框报 aria-busy，根与盒带 data-loading，加载环露出并转起来', () => {
    const api = makeField({ loading: true }).api()
    expect(api.loading).toBe(true)
    expect((api.getInputProps() as Dict)['aria-busy']).toBe('true')
    expect((api.getRootProps() as Dict)['data-loading']).toBe('')
    expect((api.getControlProps() as Dict)['data-loading']).toBe('')
    const ring = api.getLoadingProps() as Dict
    expect(ring.hidden).toBeUndefined()
    expect(ring['data-loading']).toBe('')
  })

  it('在途不算禁用：照常输入，回车照常提交', () => {
    const f = makeField({ loading: true })
    f.type('abc')
    expect(f.api().value).toBe('abc')
    expect((f.api().getInputProps() as Dict).disabled).toBeUndefined()
    f.press('Enter')
    expect(f.commits).toEqual([{ value: 'abc' }])
  })

  it('标准结构：开了 loading 才在输入框之后、清空按钮之前铺在途指示', () => {
    const control = (loading: boolean): string[] => {
      const nodes = textFieldStructure({ clearable: true, showCount: false, loading })
      return (nodes.find(node => node.part === 'control')?.children ?? []).map(node => (node as { part: string }).part)
    }
    expect(control(false)).toEqual(['input', 'clear-trigger'])
    expect(control(true)).toEqual(['input', 'loading', 'clear-trigger'])
  })
})
