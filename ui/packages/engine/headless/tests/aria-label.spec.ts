// @vitest-environment jsdom
// 表单控件的 ariaLabel 写到承担名字的那个部件上：简单控件直接写 aria-label；名字链还接着值文本的，
// 没有 label 部件时串首换成触发钮自己；没有角色的容器只在给了名字时当一个具名的组；
// 名字链引到投放区自己取内容的，渲染了 label 部件时不写 aria-label。
import type { MachineConfig, MachineSchema, Service } from '@xihan-ui/core'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { checkboxMachine, connectCheckbox } from '../src/checkbox'
import { connectFieldArray, fieldArrayMachine } from '../src/field-array'
import { connectFileUpload, fileUploadMachine } from '../src/file-upload'
import { connectMention, mentionMachine } from '../src/mention'
import { connectSelect, selectMachine } from '../src/select'
import { connectTextField, textFieldMachine } from '../src/text-field'
import { connectTransfer, transferMachine } from '../src/transfer'

function serve<T extends MachineSchema>(machine: MachineConfig<T>, props: T['props']): Service<T> {
  const runtime = createVanillaRuntime()
  const service = createService(machine, { props: () => props, runtime })
  runtime.start()
  return service
}

const NAME = '自定名字'

describe('ariaLabel', () => {
  it('text-field：写在 input 上；渲染了 label 部件时名字链指向 label，aria-label 由它盖过', () => {
    const bare = connectTextField(serve(textFieldMachine, { ariaLabel: NAME }), normalizeProps).getInputProps() as Record<string, unknown>
    expect([bare['aria-label'], bare['aria-labelledby']]).toEqual([NAME, undefined])
    const api = connectTextField(serve(textFieldMachine, { ariaLabel: NAME, labelled: true }), normalizeProps)
    expect((api.getInputProps() as Record<string, unknown>)['aria-labelledby']).toBe(api.getLabelProps().id)
  })

  it('checkbox：写在根（role=checkbox）上', () => {
    expect((connectCheckbox(serve(checkboxMachine, { ariaLabel: NAME }), normalizeProps).getRootProps() as Record<string, unknown>)['aria-label']).toBe(NAME)
  })

  it('select：没有 label 部件时触发钮的名字链换成自己接值文本，列表同源；有 label 部件时照旧是 label 接值文本', () => {
    const api = connectSelect(serve(selectMachine, { ariaLabel: NAME }), normalizeProps)
    const trigger = api.getTriggerProps() as Record<string, string>
    const valueText = (api.getValueTextProps() as Record<string, string>).id
    expect(trigger['aria-label']).toBe(NAME)
    expect(trigger['aria-labelledby']).toBe(`${trigger.id} ${valueText}`)
    expect((api.getListProps() as Record<string, string>)['aria-labelledby']).toBe(`${trigger.id} ${valueText}`)
    const labelled = connectSelect(serve(selectMachine, { ariaLabel: NAME, labelled: true }), normalizeProps)
    expect((labelled.getTriggerProps() as Record<string, string>)['aria-labelledby']?.split(' ')[0]).toBe((labelled.getLabelProps() as Record<string, string>).id)
    const plain = connectSelect(serve(selectMachine, {}), normalizeProps)
    expect((plain.getTriggerProps() as Record<string, string>)['aria-labelledby']).toBe((plain.getValueTextProps() as Record<string, string>).id)
  })

  it('transfer：根平时只是容器，给了名字才当一个具名的组', () => {
    const plain = connectTransfer(serve(transferMachine, {}), normalizeProps).getRootProps() as Record<string, unknown>
    expect([plain.role, plain['aria-label']]).toEqual([undefined, undefined])
    const named = connectTransfer(serve(transferMachine, { ariaLabel: NAME }), normalizeProps).getRootProps() as Record<string, unknown>
    expect([named.role, named['aria-label']]).toEqual(['group', NAME])
  })

  it('field-array：只在表格排布下写在表格本体上', () => {
    expect((connectFieldArray(serve(fieldArrayMachine, { ariaLabel: NAME, layout: 'table' }), normalizeProps).getTableProps() as Record<string, unknown>)['aria-label']).toBe(NAME)
    expect((connectFieldArray(serve(fieldArrayMachine, { ariaLabel: NAME }), normalizeProps).getTableProps() as Record<string, unknown>)['aria-label']).toBeUndefined()
  })

  it('file-upload：名字链引到投放区自己，渲染了 label 部件时不写 aria-label，免得把投放区的说明挤出名字', () => {
    expect((connectFileUpload(serve(fileUploadMachine, { ariaLabel: NAME }), normalizeProps).getDropzoneProps() as Record<string, unknown>)['aria-label']).toBe(NAME)
    expect((connectFileUpload(serve(fileUploadMachine, { ariaLabel: NAME, labelled: true }), normalizeProps).getDropzoneProps() as Record<string, unknown>)['aria-label']).toBeUndefined()
  })

  it('mention：给了 translations.input 时照旧由它命名；没给时才写 ariaLabel，两样都没给不输出这一键', () => {
    const named = connectMention(serve(mentionMachine, { ariaLabel: NAME }), normalizeProps).getInputProps() as Record<string, unknown>
    expect(named['aria-label']).toBe(NAME)
    const translated = connectMention(serve(mentionMachine, { ariaLabel: NAME, translations: { input: '正文' } }), normalizeProps).getInputProps() as Record<string, unknown>
    expect(translated['aria-label']).toBe('正文')
    expect('aria-label' in (connectMention(serve(mentionMachine, {}), normalizeProps).getInputProps() as Record<string, unknown>)).toBe(false)
  })
})
