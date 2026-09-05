// @vitest-environment jsdom
import type { Service } from '@xihan-ui/core'
import type { EditableSchema, EditableValueCommitDetails, EditableValueRevertDetails } from '../src/editable/index'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import {
  clampEditableValue,
  connectEditable,
  editableInputSize,
  editableMachine,
  submitsOnEnter,
  submitsOnLeave,
} from '../src/editable/index'

type Props = EditableSchema['props']
type Dict = Record<string, unknown>

/** 起一台机器，并留一个改 props 的口子（受控回写、运行期改 disabled 都靠它）。 */
function makeService(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  // props 走 signal 而不是裸对象：改 edit 要真的惊动 watch，才验得到受控回写这一路。
  // 每次写入都换成新对象，解释器的归一化缓存也才会跟着失效
  const props = runtime.signal<Props>(initial)
  const service = createService(editableMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    api: () => connectEditable(service, normalizeProps),
    value: () => service.context.get('value'),
    committed: () => service.context.get('committedValue'),
    state: () => service.state.get(),
  }
}

function keyEvent(key: string, mods: Partial<Record<'ctrlKey' | 'metaKey' | 'altKey', boolean>> = {}) {
  return { key, ctrlKey: false, metaKey: false, altKey: false, ...mods, preventDefault: vi.fn() }
}

function pointerEvent(button: number) {
  return { button, preventDefault: vi.fn() }
}

function fire(props: Dict, key: string, event: unknown = {}): void {
  (props[key] as (e: unknown) => void)(event)
}

describe('submitsOnEnter / submitsOnLeave', () => {
  it('两条策略各管一头，缺省（both）时两头都算提交', () => {
    expect(submitsOnEnter('enter')).toBe(true)
    expect(submitsOnEnter('both')).toBe(true)
    expect(submitsOnEnter('blur')).toBe(false)
    expect(submitsOnEnter('none')).toBe(false)
    expect(submitsOnEnter(undefined)).toBe(true)

    expect(submitsOnLeave('blur')).toBe(true)
    expect(submitsOnLeave('both')).toBe(true)
    expect(submitsOnLeave('enter')).toBe(false)
    expect(submitsOnLeave('none')).toBe(false)
    expect(submitsOnLeave(undefined)).toBe(true)
  })
})

describe('clampEditableValue', () => {
  it('超出上限的尾巴被切掉，没超的原样不动', () => {
    expect(clampEditableValue('abcdef', 3)).toBe('abc')
    expect(clampEditableValue('abc', 3)).toBe('abc')
  })

  it('上限为 0 意味着一个字都收不下，不是"没给上限"', () => {
    // 0 是假值，用 `maxLength &&` 判断会让 maxLength=0 整个失效
    expect(clampEditableValue('abc', 0)).toBe('')
  })

  it('没给、负数与非有限值一律不插手', () => {
    expect(clampEditableValue('abc', undefined)).toBe('abc')
    expect(clampEditableValue('abc', -1)).toBe('abc')
    expect(clampEditableValue('abc', Number.NaN)).toBe('abc')
  })
})

describe('editableInputSize', () => {
  it('有值按值算，空值退回占位长度', () => {
    expect(editableInputSize('阿旺', undefined)).toBe(2)
    expect(editableInputSize('', '请输入昵称')).toBe(5)
  })

  it('值与占位都空时至少留一格：size=0 会缩成一条看不见的缝', () => {
    expect(editableInputSize('', undefined)).toBe(1)
    expect(editableInputSize('', '')).toBe(1)
  })

  it('按码点数，代理对不算两格', () => {
    // 用 length 的话表情会撑出双倍宽度
    expect(editableInputSize('😀😀', undefined)).toBe(2)
  })
})

describe('editableMachine 编辑态进出', () => {
  it('默认预览态，defaultEdit / edit 都能决定初态', () => {
    expect(makeService().state()).toBe('preview')
    expect(makeService({ defaultEdit: true }).state()).toBe('edit')
    expect(makeService({ edit: true }).state()).toBe('edit')
  })

  it('进编辑态时通知宿主；disabled / readOnly 下整条被吃掉，连意图都不发', () => {
    const onEditChange = vi.fn()
    const open = makeService({ onEditChange })
    open.service.send({ type: 'EDIT.START' })
    expect(open.state()).toBe('edit')
    expect(onEditChange).toHaveBeenCalledWith({ edit: true })

    for (const guardProp of ['disabled', 'readOnly'] as const) {
      const notify = vi.fn()
      const blocked = makeService({ [guardProp]: true, onEditChange: notify })
      blocked.service.send({ type: 'EDIT.START' })
      expect(blocked.state()).toBe('preview')
      // 发了意图，宿主会以为该进编辑态了——受控场景下这等于绕过禁用
      expect(notify).not.toHaveBeenCalled()
    }
  })

  it('进编辑态那一刻拍下撤销落点，受控回写进来的那一路也拍', () => {
    const s = makeService({ defaultValue: '阿旺' })
    s.service.send({ type: 'VALUE.SET', value: '小黑' })
    expect(s.committed()).toBe('阿旺')
    s.service.send({ type: 'EDIT.START' })
    // 预览态里改过的值也是"已经落定的值"，进编辑态时快照必须跟上
    expect(s.committed()).toBe('小黑')

    const controlled = makeService({ edit: false, defaultValue: '阿旺' })
    controlled.service.send({ type: 'VALUE.SET', value: '小黑' })
    controlled.setProps({ edit: true })
    expect(controlled.state()).toBe('edit')
    expect(controlled.committed()).toBe('小黑')
  })

  it('提交：落下新的撤销落点、发 onValueCommit（带上一次提交值）、回预览态', () => {
    const onValueCommit = vi.fn<(d: EditableValueCommitDetails) => void>()
    const s = makeService({ defaultValue: '阿旺', onValueCommit })
    s.service.send({ type: 'EDIT.START' })
    s.service.send({ type: 'VALUE.SET', value: '小黑' })
    s.service.send({ type: 'EDIT.SUBMIT' })
    expect(s.state()).toBe('preview')
    expect(s.value()).toBe('小黑')
    expect(s.committed()).toBe('小黑')
    expect(onValueCommit).toHaveBeenCalledWith({ value: '小黑', previousValue: '阿旺' })
  })

  it('提交时值没变也照发：提交是"确认过一遍"，不是"值变了"的另一种说法', () => {
    const onValueCommit = vi.fn()
    const s = makeService({ defaultValue: '阿旺', onValueCommit })
    s.service.send({ type: 'EDIT.START' })
    s.service.send({ type: 'EDIT.SUBMIT' })
    expect(onValueCommit).toHaveBeenCalledWith({ value: '阿旺', previousValue: '阿旺' })
  })

  it('撤销：值还回上一次提交的那个，并把丢掉的那份一并交代清楚', () => {
    const onValueRevert = vi.fn<(d: EditableValueRevertDetails) => void>()
    const onValueChange = vi.fn()
    const s = makeService({ defaultValue: '阿旺', onValueRevert, onValueChange })
    s.service.send({ type: 'EDIT.START' })
    s.service.send({ type: 'VALUE.SET', value: '小黑' })
    s.service.send({ type: 'EDIT.CANCEL' })
    expect(s.state()).toBe('preview')
    expect(s.value()).toBe('阿旺')
    expect(onValueRevert).toHaveBeenCalledWith({ value: '阿旺', discardedValue: '小黑' })
    // 撤销把值改回去了，值变化本身也得通知：受控宿主全靠这一条把框里的字拨回去
    expect(onValueChange).toHaveBeenLastCalledWith({ value: '阿旺' })
  })

  it('撤销回同一个值时不惊动 onValueChange，撤销回调照发', () => {
    const onValueChange = vi.fn()
    const onValueRevert = vi.fn()
    const s = makeService({ defaultValue: '阿旺', onValueChange, onValueRevert })
    s.service.send({ type: 'EDIT.START' })
    s.service.send({ type: 'EDIT.CANCEL' })
    expect(onValueChange).not.toHaveBeenCalled()
    expect(onValueRevert).toHaveBeenCalledWith({ value: '阿旺', discardedValue: '阿旺' })
  })

  it('提交与撤销不再看 disabled / readOnly：进得来就得出得去', () => {
    // 只有受控 edit 能把只读控件推进编辑态，出口若也拦着，用户就被锁死在里面
    const s = makeService({ edit: true, readOnly: true, defaultValue: '阿旺' })
    const onEditChange = vi.fn()
    s.setProps({ onEditChange })
    s.service.send({ type: 'EDIT.CANCEL' })
    expect(onEditChange).toHaveBeenCalledWith({ edit: false })
  })

  it('离场按 submitMode 分岔：算提交就提交，不算就撤销', () => {
    for (const submitMode of ['blur', 'both'] as const) {
      const onValueCommit = vi.fn()
      const s = makeService({ defaultValue: '阿旺', submitMode, onValueCommit })
      s.service.send({ type: 'EDIT.START' })
      s.service.send({ type: 'VALUE.SET', value: '小黑' })
      s.service.send({ type: 'EDIT.LEAVE', src: 'blur' })
      expect(s.state()).toBe('preview')
      expect(s.value()).toBe('小黑')
      expect(onValueCommit).toHaveBeenCalledTimes(1)
    }

    for (const submitMode of ['enter', 'none'] as const) {
      const onValueCommit = vi.fn()
      const onValueRevert = vi.fn()
      const s = makeService({ defaultValue: '阿旺', submitMode, onValueCommit, onValueRevert })
      s.service.send({ type: 'EDIT.START' })
      s.service.send({ type: 'VALUE.SET', value: '小黑' })
      s.service.send({ type: 'EDIT.LEAVE', src: 'tab' })
      expect(s.state()).toBe('preview')
      // 留着没提交过的值回预览态，界面就会显示一个宿主从没收到过的东西
      expect(s.value()).toBe('阿旺')
      expect(onValueCommit).not.toHaveBeenCalled()
      expect(onValueRevert).toHaveBeenCalledTimes(1)
    }
  })

  it('预览态收到的离场事件无人接管：退出时把焦点还回去带出的那条 blur 不该再撤一次', () => {
    const onValueRevert = vi.fn()
    const s = makeService({ defaultValue: '阿旺', submitMode: 'none', onValueRevert })
    s.service.send({ type: 'EDIT.START' })
    s.service.send({ type: 'EDIT.CANCEL' })
    onValueRevert.mockClear()
    s.service.send({ type: 'EDIT.LEAVE', src: 'blur' })
    expect(onValueRevert).not.toHaveBeenCalled()
  })
})

describe('editableMachine 受控', () => {
  it('受控编辑态：状态纹丝不动，意图照发；宿主写回后跟着走', () => {
    const onEditChange = vi.fn()
    const s = makeService({ edit: false, onEditChange })
    s.service.send({ type: 'EDIT.START' })
    expect(s.state()).toBe('preview')
    expect(onEditChange).toHaveBeenCalledWith({ edit: true })

    s.setProps({ edit: true })
    expect(s.state()).toBe('edit')

    s.service.send({ type: 'EDIT.SUBMIT' })
    // 宿主还没写回，状态就还在编辑态；但值已经提交出去了
    expect(s.state()).toBe('edit')
    expect(onEditChange).toHaveBeenLastCalledWith({ edit: false })
    s.setProps({ edit: false })
    expect(s.state()).toBe('preview')
  })

  it('受控编辑态下离场同样两条都走到：提交/撤销发生，状态仍归宿主', () => {
    const onValueCommit = vi.fn()
    const commit = makeService({ edit: true, defaultValue: '阿旺', submitMode: 'blur', onValueCommit })
    commit.service.send({ type: 'VALUE.SET', value: '小黑' })
    commit.service.send({ type: 'EDIT.LEAVE', src: 'blur' })
    expect(commit.state()).toBe('edit')
    expect(onValueCommit).toHaveBeenCalledWith({ value: '小黑', previousValue: '阿旺' })

    const onValueRevert = vi.fn()
    const revert = makeService({ edit: true, defaultValue: '阿旺', submitMode: 'none', onValueRevert })
    revert.service.send({ type: 'VALUE.SET', value: '小黑' })
    revert.service.send({ type: 'EDIT.LEAVE', src: 'blur' })
    expect(revert.state()).toBe('edit')
    expect(revert.value()).toBe('阿旺')
    expect(onValueRevert).toHaveBeenCalledTimes(1)
  })

  it('edit 变回 undefined 是转非受控，不强制退出编辑态', () => {
    const s = makeService({ edit: true })
    s.setProps({ edit: undefined })
    expect(s.state()).toBe('edit')
  })

  it('受控 value：机器不自改值，回调照发；宿主写回后以宿主的为准', () => {
    const onValueChange = vi.fn()
    const s = makeService({ value: 'host', onValueChange })
    s.service.send({ type: 'VALUE.SET', value: 'typed' })
    expect(s.value()).toBe('host')
    expect(onValueChange).toHaveBeenCalledWith({ value: 'typed' })
    s.setProps({ value: 'typed' })
    expect(s.value()).toBe('typed')
  })
})

describe('editableMachine 写值', () => {
  it('按 maxLength 截断，通知里带的是落库的那个', () => {
    const onValueChange = vi.fn()
    const s = makeService({ maxLength: 3, onValueChange })
    s.service.send({ type: 'VALUE.SET', value: 'abcdef' })
    expect(s.value()).toBe('abc')
    expect(onValueChange).toHaveBeenCalledWith({ value: 'abc' })
  })

  it('disabled / readOnly 下写不进去', () => {
    for (const guardProp of ['disabled', 'readOnly'] as const) {
      const s = makeService({ defaultValue: 'keep', [guardProp]: true })
      s.service.send({ type: 'VALUE.SET', value: 'changed' })
      expect(s.value()).toBe('keep')
    }
  })
})

describe('connectEditable 结构与标注', () => {
  it('root 是有名字的 group，状态位齐全', () => {
    const api = makeService().api()
    const root = api.getRootProps() as Dict
    expect(root['data-scope']).toBe('editable')
    expect(root['data-part']).toBe('root')
    expect(root.role).toBe('group')
    expect(root['aria-labelledby']).toBe((api.getLabelProps() as Dict).id)
    expect(root['data-state']).toBe('preview')
    expect(root['data-empty']).toBe('')
    expect(root['data-disabled']).toBeUndefined()
  })

  it('label 的 for 指向 input 自己的 id，input 反手 aria-labelledby 指回 label', () => {
    const api = makeService().api()
    const label = api.getLabelProps() as Dict
    const input = api.getInputProps() as Dict
    expect(label.for).toBe(input.id)
    expect(input['aria-labelledby']).toBe(label.id)
    // 撞名会让两个节点抢同一个 IDREF
    expect(label.id).not.toBe(input.id)
  })

  it('两个形态一个显示时另一个带 hidden，谁都不卸载', () => {
    const preview = makeService().api()
    expect((preview.getPreviewProps() as Dict).hidden).toBeUndefined()
    expect((preview.getInputProps() as Dict).hidden).toBe(true)

    const edit = makeService({ defaultEdit: true }).api()
    expect((edit.getPreviewProps() as Dict).hidden).toBe(true)
    expect((edit.getInputProps() as Dict).hidden).toBeUndefined()
  })

  it('三颗按钮各自跟着形态收起：预览态露编辑钮，编辑态露提交与取消', () => {
    const preview = makeService().api()
    expect((preview.getEditTriggerProps() as Dict).hidden).toBeUndefined()
    expect((preview.getSubmitTriggerProps() as Dict).hidden).toBe(true)
    expect((preview.getSubmitTriggerProps() as Dict).disabled).toBe(true)
    expect((preview.getCancelTriggerProps() as Dict).hidden).toBe(true)

    const edit = makeService({ defaultEdit: true }).api()
    expect((edit.getEditTriggerProps() as Dict).hidden).toBe(true)
    expect((edit.getSubmitTriggerProps() as Dict).hidden).toBeUndefined()
    expect((edit.getSubmitTriggerProps() as Dict).disabled).toBeUndefined()
    expect((edit.getCancelTriggerProps() as Dict).hidden).toBeUndefined()
  })

  it('预览区显示值，值为空时退回 placeholder 并标 data-placeholder', () => {
    const filled = makeService({ defaultValue: '阿旺', placeholder: '未填写' }).api()
    expect(filled.displayValue).toBe('阿旺')
    expect((filled.getPreviewProps() as Dict)['data-placeholder']).toBeUndefined()

    const empty = makeService({ placeholder: '未填写' }).api()
    expect(empty.displayValue).toBe('未填写')
    expect((empty.getPreviewProps() as Dict)['data-placeholder']).toBe('')

    // 占位也没给就交白卷，不去编个 "-" 之类的东西
    expect(makeService().api().displayValue).toBe('')
  })

  it('预览区的 Tab 位随激活方式变：focus 模式占位，其余只留程序化焦点，不可编辑时不给', () => {
    expect((makeService({ activationMode: 'focus' }).api().getPreviewProps() as Dict).tabindex).toBe(0)
    // 键盘入口是 edit-trigger，但退出编辑态要把焦点还回来，所以仍需 -1
    expect((makeService({ activationMode: 'click' }).api().getPreviewProps() as Dict).tabindex).toBe(-1)
    expect((makeService({ activationMode: 'none' }).api().getPreviewProps() as Dict).tabindex).toBe(-1)
    expect((makeService({ disabled: true }).api().getPreviewProps() as Dict).tabindex).toBeUndefined()
    expect((makeService({ readOnly: true }).api().getPreviewProps() as Dict).tabindex).toBeUndefined()
  })

  it('disabled 用原生 disabled；readOnly 只给 readonly，绝不顺手加 disabled', () => {
    const disabled = makeService({ disabled: true }).api()
    expect((disabled.getInputProps() as Dict).disabled).toBe(true)
    expect((disabled.getEditTriggerProps() as Dict).disabled).toBe(true)
    expect((disabled.getPreviewProps() as Dict)['aria-disabled']).toBe('true')

    const readOnly = makeService({ readOnly: true }).api()
    const input = readOnly.getInputProps() as Dict
    expect(input.readonly).toBe(true)
    // 加了原生 disabled，只读框就不可聚焦、内容也选不中复制了
    expect(input.disabled).toBeUndefined()
    // 只读进不了编辑态，编辑钮跟着关掉
    expect((readOnly.getEditTriggerProps() as Dict).disabled).toBe(true)
    // 只读不是禁用，别对读屏说成禁用
    expect((readOnly.getPreviewProps() as Dict)['aria-disabled']).toBe('false')
  })

  it('invalid 落在 input 与 root 上，aria-invalid 显式给 true/false', () => {
    const api = makeService({ invalid: true }).api()
    expect((api.getInputProps() as Dict)['aria-invalid']).toBe('true')
    expect((api.getRootProps() as Dict)['data-invalid']).toBe('')
    expect((makeService().api().getInputProps() as Dict)['aria-invalid']).toBe('false')
  })

  it('autoResize 才产出 size，且跟着值走；不开时连接层不碰宽度', () => {
    const on = makeService({ defaultValue: '阿旺', autoResize: true }).api()
    expect((on.getInputProps() as Dict).size).toBe(2)
    const off = makeService({ defaultValue: '阿旺' }).api()
    expect((off.getInputProps() as Dict).size).toBeUndefined()
    expect((off.getInputProps() as Dict)['data-auto-resize']).toBeUndefined()
  })

  it('maxLength 同时落成原生属性', () => {
    expect((makeService({ maxLength: 8 }).api().getInputProps() as Dict).maxlength).toBe(8)
  })
})

describe('connectEditable 激活与提交', () => {
  it('click 模式：单击预览区进编辑态，双击与聚焦都不算', () => {
    const s = makeService({ activationMode: 'click' })
    fire(s.api().getPreviewProps() as Dict, 'onDblClick')
    expect(s.state()).toBe('preview')
    fire(s.api().getPreviewProps() as Dict, 'onFocus', { relatedTarget: null })
    expect(s.state()).toBe('preview')
    fire(s.api().getPreviewProps() as Dict, 'onClick')
    expect(s.state()).toBe('edit')
  })

  it('dblclick 模式：单击不进，双击才进', () => {
    const s = makeService({ activationMode: 'dblclick' })
    fire(s.api().getPreviewProps() as Dict, 'onClick')
    expect(s.state()).toBe('preview')
    fire(s.api().getPreviewProps() as Dict, 'onDblClick')
    expect(s.state()).toBe('edit')
  })

  it('focus 模式：聚焦即进；但焦点是从自己那个输入框还回来的就不进', () => {
    const s = makeService({ activationMode: 'focus' })
    const inputId = (s.api().getInputProps() as Dict).id as string
    // 退出编辑态时我们主动把焦点还给预览区，这一下若再进编辑态，focus 模式就永远出不去
    fire(s.api().getPreviewProps() as Dict, 'onFocus', { relatedTarget: { id: inputId } })
    expect(s.state()).toBe('preview')
    // 别的地方来的焦点照常进
    fire(s.api().getPreviewProps() as Dict, 'onFocus', { relatedTarget: { id: 'somewhere-else' } })
    expect(s.state()).toBe('edit')
  })

  it('none 模式：预览区与标题都不认交互，只剩编辑钮', () => {
    const s = makeService({ activationMode: 'none' })
    fire(s.api().getPreviewProps() as Dict, 'onClick')
    fire(s.api().getPreviewProps() as Dict, 'onDblClick')
    fire(s.api().getLabelProps() as Dict, 'onClick')
    expect(s.state()).toBe('preview')
    fire(s.api().getEditTriggerProps() as Dict, 'onClick')
    expect(s.state()).toBe('edit')
  })

  it('点标题也能进编辑态：for 指着的输入框在预览态是收起的，点了没反应', () => {
    const s = makeService()
    fire(s.api().getLabelProps() as Dict, 'onClick')
    expect(s.state()).toBe('edit')
  })

  it('禁用/只读时预览区与编辑钮都推不动（直接调处理器也推不动）', () => {
    for (const guardProp of ['disabled', 'readOnly'] as const) {
      const s = makeService({ [guardProp]: true })
      // 禁用按钮上浏览器根本不派 click，只有直接调处理器才碰得到这层判断
      fire(s.api().getPreviewProps() as Dict, 'onClick')
      fire(s.api().getEditTriggerProps() as Dict, 'onClick')
      expect(s.state()).toBe('preview')
    }
  })

  it('回车提交并拦下默认行为；不算提交的模式一个字都不动，也不吞键', () => {
    const submit = makeService({ defaultEdit: true, defaultValue: '阿旺', submitMode: 'both' })
    const onValueCommit = vi.fn()
    submit.setProps({ onValueCommit })
    const enter = keyEvent('Enter')
    fire(submit.api().getInputProps() as Dict, 'onKeyDown', enter)
    expect(submit.state()).toBe('preview')
    expect(enter.preventDefault).toHaveBeenCalled()
    expect(onValueCommit).toHaveBeenCalledTimes(1)

    // 吞了键，多行输入换不了行、外层表单也提交不了
    for (const submitMode of ['blur', 'none'] as const) {
      const s = makeService({ defaultEdit: true, submitMode })
      const event = keyEvent('Enter')
      fire(s.api().getInputProps() as Dict, 'onKeyDown', event)
      expect(s.state()).toBe('edit')
      expect(event.preventDefault).not.toHaveBeenCalled()
    }
  })

  it('escape 撤销并拦下默认行为', () => {
    const s = makeService({ defaultEdit: true, defaultValue: '阿旺' })
    s.service.send({ type: 'VALUE.SET', value: '小黑' })
    const event = keyEvent('Escape')
    fire(s.api().getInputProps() as Dict, 'onKeyDown', event)
    expect(s.state()).toBe('preview')
    expect(s.value()).toBe('阿旺')
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('tab 按 submitMode 收尾，但绝不拦默认行为——焦点得照常走', () => {
    const s = makeService({ defaultEdit: true, defaultValue: '阿旺', submitMode: 'both' })
    s.service.send({ type: 'VALUE.SET', value: '小黑' })
    const event = keyEvent('Tab')
    fire(s.api().getInputProps() as Dict, 'onKeyDown', event)
    expect(s.state()).toBe('preview')
    expect(s.value()).toBe('小黑')
    // 拦了这一下，Tab 就再也走不到下一个控件
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('带修饰键的按键一律不接管', () => {
    const s = makeService({ defaultEdit: true })
    for (const event of [keyEvent('Enter', { ctrlKey: true }), keyEvent('Escape', { metaKey: true }), keyEvent('Tab', { altKey: true })]) {
      fire(s.api().getInputProps() as Dict, 'onKeyDown', event)
      expect(event.preventDefault).not.toHaveBeenCalled()
    }
    expect(s.state()).toBe('edit')
  })

  it('预览态的输入框不接管任何键：它是收起的，聚焦上去也不该有编辑态行为', () => {
    const s = makeService({ defaultValue: '阿旺' })
    const event = keyEvent('Escape')
    fire(s.api().getInputProps() as Dict, 'onKeyDown', event)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(s.state()).toBe('preview')
  })

  it('输入框敲字把当下的值送进机器', () => {
    const s = makeService({ defaultEdit: true })
    fire(s.api().getInputProps() as Dict, 'onInput', { target: { value: 'hello' } })
    expect(s.value()).toBe('hello')
  })

  it('提交钮与取消钮按下时把焦点摁住，右键不拦', () => {
    const s = makeService({ defaultEdit: true })
    for (const get of ['getSubmitTriggerProps', 'getCancelTriggerProps'] as const) {
      const props = s.api()[get]() as Dict
      const primary = pointerEvent(0)
      fire(props, 'onPointerDown', primary)
      // 不拦就会先派 blur：机器当场按 submitMode 收尾并把按钮收起，这一下 click 再也落不到按钮上
      expect(primary.preventDefault).toHaveBeenCalled()
      const secondary = pointerEvent(2)
      fire(props, 'onPointerDown', secondary)
      expect(secondary.preventDefault).not.toHaveBeenCalled()
    }
  })

  it('提交钮提交、取消钮撤销；预览态下直接调处理器也推不动', () => {
    const submit = makeService({ defaultEdit: true, defaultValue: '阿旺' })
    submit.service.send({ type: 'VALUE.SET', value: '小黑' })
    fire(submit.api().getSubmitTriggerProps() as Dict, 'onClick')
    expect(submit.state()).toBe('preview')
    expect(submit.value()).toBe('小黑')

    const cancel = makeService({ defaultEdit: true, defaultValue: '阿旺' })
    cancel.service.send({ type: 'VALUE.SET', value: '小黑' })
    fire(cancel.api().getCancelTriggerProps() as Dict, 'onClick')
    expect(cancel.state()).toBe('preview')
    expect(cancel.value()).toBe('阿旺')

    // 收起的按钮上浏览器不派 click，只有直接调处理器才碰得到这层判断
    const idle = makeService({ defaultValue: '阿旺' })
    fire(idle.api().getSubmitTriggerProps() as Dict, 'onClick')
    fire(idle.api().getCancelTriggerProps() as Dict, 'onClick')
    expect(idle.state()).toBe('preview')
  })

  it('输入框失焦发离场事件，收尾归机器判', () => {
    const s = makeService({ defaultEdit: true, defaultValue: '阿旺', submitMode: 'blur' })
    s.service.send({ type: 'VALUE.SET', value: '小黑' })
    fire(s.api().getInputProps() as Dict, 'onBlur')
    expect(s.state()).toBe('preview')
    expect(s.value()).toBe('小黑')
  })

  it('api 的三个动作与部件走的是同一条路', () => {
    const s = makeService({ defaultValue: '阿旺' })
    s.api().edit()
    expect(s.state()).toBe('edit')
    s.api().setValue('小黑')
    s.api().cancel()
    expect(s.value()).toBe('阿旺')
    s.api().edit()
    s.api().setValue('小黑')
    s.api().submit()
    expect(s.state()).toBe('preview')
    expect(s.committed()).toBe('小黑')

    // 禁用时 api.edit 同样推不动
    const disabled = makeService({ disabled: true })
    disabled.api().edit()
    expect(disabled.state()).toBe('preview')
  })
})

// —— 焦点搬运：这一段要真 DOM ——
// 机器把 getInputEl / getPreviewEl 塞进 refs 后，进出编辑态的焦点归属才观察得到。
// 两头都推迟一拍（flush）：进来那刻输入框还收着、出去那刻预览区还收着。

interface FocusHarness {
  service: Service<EditableSchema>
  input: HTMLInputElement
  preview: HTMLElement
  outside: HTMLButtonElement
  stop: () => void
}

function makeFocusHarness(props: Props = {}): FocusHarness {
  const host = document.createElement('div')
  const preview = document.createElement('span')
  preview.tabIndex = -1
  const input = document.createElement('input')
  // 适配器渲染那一步在这里手工补上：框里得先有字，全选才有东西可选
  input.value = props.defaultValue ?? props.value ?? ''
  const outside = document.createElement('button')
  host.append(preview, input, outside)
  document.body.appendChild(host)

  const runtime = createVanillaRuntime()
  const service = createService(editableMachine, { props: () => props, runtime })
  service.refs.set('getInputEl', () => input)
  service.refs.set('getPreviewEl', () => preview)
  runtime.start()
  return {
    service,
    input,
    preview,
    outside,
    stop: () => {
      runtime.stop()
      host.remove()
    },
  }
}

/** 等 flush（微任务）跑完。 */
const microtask = (): Promise<void> => Promise.resolve()
/** 等一帧：这一拍还聚焦不上时的重试排在 rAF 上。 */
const frame = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => resolve()))

describe('editableMachine 焦点搬运', () => {
  it('进编辑态把焦点搬进输入框并全选', async () => {
    const h = makeFocusHarness({ defaultValue: '阿旺' })
    h.service.send({ type: 'EDIT.START' })
    // 推迟这一拍不是可有可无：进编辑态那一刻输入框还带着 hidden，此刻聚焦是空操作
    expect(document.activeElement).not.toBe(h.input)
    await microtask()
    expect(document.activeElement).toBe(h.input)
    expect(h.input.selectionStart).toBe(0)
    expect(h.input.selectionEnd).toBe(2)
    h.stop()
  })

  it('这一拍还聚焦不上就下一帧再试：宿主提交的时机不归机器管', async () => {
    const h = makeFocusHarness({ defaultValue: '阿旺' })
    // 复现"宿主还没把输入框露出来"那一拍。真实浏览器里收起的节点 focus() 是空操作，
    // 而 jsdom 不看 hidden 照样聚焦得上，只能拿 disabled 演这一幕
    h.input.disabled = true
    h.service.send({ type: 'EDIT.START' })
    await microtask()
    expect(document.activeElement).not.toBe(h.input)
    // 宿主这才把它露出来：没有重试的话，焦点就永远停在 body 上了
    h.input.disabled = false
    await frame()
    expect(document.activeElement).toBe(h.input)
    h.stop()
  })

  it('selectOnFocus 关掉时只聚焦、不全选', async () => {
    const h = makeFocusHarness({ defaultValue: '阿旺', selectOnFocus: false })
    h.service.send({ type: 'EDIT.START' })
    await microtask()
    expect(document.activeElement).toBe(h.input)
    // 写值那一下光标就顶在末尾了，只有全选会把 selectionStart 拉回 0
    expect(h.input.selectionStart).toBe(2)
    expect(h.input.selectionEnd).toBe(2)
    h.stop()
  })

  it('退出编辑态把焦点还给预览区', async () => {
    const h = makeFocusHarness({ defaultValue: '阿旺' })
    h.service.send({ type: 'EDIT.START' })
    await microtask()
    h.service.send({ type: 'EDIT.SUBMIT' })
    await microtask()
    expect(document.activeElement).toBe(h.preview)
    h.stop()
  })

  it('焦点已经不在输入框里就不抢：Tab 出去时抢回来等于把光标从用户手里夺走', async () => {
    const h = makeFocusHarness({ defaultValue: '阿旺' })
    h.service.send({ type: 'EDIT.START' })
    await microtask()
    // Tab 的真实形状：焦点先落到下一个控件，随后才轮到收尾
    h.outside.focus()
    h.service.send({ type: 'EDIT.LEAVE', src: 'tab' })
    await microtask()
    expect(document.activeElement).toBe(h.outside)
    h.stop()
  })

  it('一出一进挨得很近时不把焦点从刚打开的输入框里拖走', async () => {
    const h = makeFocusHarness({ defaultValue: '阿旺' })
    h.service.send({ type: 'EDIT.START' })
    await microtask()
    h.service.send({ type: 'EDIT.CANCEL' })
    h.service.send({ type: 'EDIT.START' })
    await microtask()
    expect(document.activeElement).toBe(h.input)
    h.stop()
  })

  it('无 DOM getter（纯逻辑宿主）时状态照常转移，只是不搬焦点', async () => {
    const runtime = createVanillaRuntime()
    const service = createService(editableMachine, { props: () => ({}), runtime })
    runtime.start()
    service.send({ type: 'EDIT.START' })
    await microtask()
    expect(service.state.get()).toBe('edit')
    runtime.stop()
  })
})
