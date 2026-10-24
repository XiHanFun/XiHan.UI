import type { FormFieldModel, FormSchema, SwitchSchema, TextFieldSchema } from '../src'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { bindFormModel, connectSwitch, connectTextField, formFieldModel, formMachine, formModelOf, switchMachine, textFieldMachine } from '../src'

/** 一张表单，外加一个放在它某个字段组里的控件：控件的 props 每次都经 bindFormModel 现取。 */
function mountBound<S extends TextFieldSchema | SwitchSchema>(
  machine: S extends TextFieldSchema ? typeof textFieldMachine : typeof switchMachine,
  name: string,
  formProps: FormSchema['props'],
  controlProps: S['props'] = {},
) {
  const runtime = createVanillaRuntime()
  const form = createService(formMachine, { props: () => formProps, runtime })
  const field = formFieldModel(form, () => name)
  const own = runtime.signal<S['props']>(controlProps)
  const control = createService(machine as never, {
    props: () => bindFormModel(own.get(), formModelOf(machine.name), field),
    runtime,
  }) as never as ReturnType<typeof createService<S>>
  runtime.start()
  return {
    form,
    control,
    setOwn: (next: S['props']) => own.set({ ...own.get(), ...next }),
    values: () => form.context.get('values'),
  }
}

describe('formModelOf', () => {
  it('按机器名给出值通道：多数是 value，勾选类是 checked，文件上传是 files', () => {
    expect(formModelOf('select')).toEqual({ prop: 'value', defaultProp: 'defaultValue', onChange: 'onValueChange', detail: 'value' })
    expect(formModelOf('checkbox')).toEqual({ prop: 'checked', defaultProp: 'defaultChecked', onChange: 'onCheckedChange', detail: 'checked' })
    expect(formModelOf('switch')?.prop).toBe('checked')
    expect(formModelOf('file-upload')).toEqual({ prop: 'files', defaultProp: 'defaultFiles', onChange: 'onFilesChange', detail: 'files' })
  })

  it('字段、字段数组与非录入组件不接字段值；原型链上的键不算登记', () => {
    expect(formModelOf('field')).toBeUndefined()
    expect(formModelOf('field-array')).toBeUndefined()
    expect(formModelOf('dialog')).toBeUndefined()
    expect(formModelOf('constructor')).toBeUndefined()
  })
})

describe('bindFormModel', () => {
  const model = formModelOf('text-field')!
  const field = (value: unknown) => {
    const port = { value: () => value, setValue: vi.fn<(next: unknown) => void>() }
    return port satisfies FormFieldModel
  }

  it('不在字段组里或机器不接字段值时原样返回', () => {
    const props = { value: undefined }
    expect(bindFormModel(props, model, null)).toBe(props)
    expect(bindFormModel(props, undefined, field('x'))).toBe(props)
  })

  it('实例自己给了值（null 也算）时一概不接，手动接法照旧', () => {
    const port = field('来自表单')
    const props = { value: '自己的' }
    expect(bindFormModel(props, model, port)).toBe(props)
    const nullable = { value: null }
    expect(bindFormModel(nullable, formModelOf('radio-group'), port)).toBe(nullable)
  })

  it('字段有值时以它为准；改动先写回字段，再交给控件自己的回调', () => {
    const port = field('来自表单')
    const order: string[] = []
    port.setValue.mockImplementation(() => order.push('field'))
    const own = vi.fn(() => order.push('own'))
    const bound = bindFormModel({ value: undefined, onValueChange: own }, model, port) as Record<string, unknown>
    expect(bound.value).toBe('来自表单')
    ;(bound.onValueChange as (details: unknown) => void)({ value: '新值' })
    expect(port.setValue).toHaveBeenCalledWith('新值')
    expect(own).toHaveBeenCalledWith({ value: '新值' })
    expect(order).toEqual(['field', 'own'])
  })

  it('字段有值时控件自己的初值 prop 收起：初值与重置都归表单', () => {
    const bound = bindFormModel({ defaultValue: '控件的初值' }, model, field('表单的值')) as Record<string, unknown>
    expect(bound.value).toBe('表单的值')
    expect(bound.defaultValue).toBeUndefined()
  })

  it('字段还没有值时控件照旧非受控，改动照样写进字段', () => {
    const port = field(undefined)
    const bound = bindFormModel({ defaultValue: '初值' }, model, port) as Record<string, unknown>
    expect('value' in bound).toBe(false)
    expect(bound.defaultValue).toBe('初值')
    ;(bound.onValueChange as (details: unknown) => void)({ value: '改了' })
    expect(port.setValue).toHaveBeenCalledWith('改了')
  })
})

describe('字段组里的控件按字段名读写表单的值', () => {
  it('文本框：初值取表单 defaultValues，输入写回表单，表单改值控件跟着变', () => {
    const h = mountBound<TextFieldSchema>(textFieldMachine, 'title', { defaultValues: { title: '旧标题' } })
    const api = () => connectTextField(h.control as never, normalizeProps)
    expect(api().value).toBe('旧标题')

    api().setValue('新标题')
    expect(h.values()).toEqual({ title: '新标题' })
    expect(api().value).toBe('新标题')

    h.form.send({ type: 'FIELD.SET', name: 'title', value: '外部改的' })
    expect(api().value).toBe('外部改的')
  })

  it('开关：checked 通道，切换写回布尔值', () => {
    const h = mountBound<SwitchSchema>(switchMachine, 'notify', { defaultValues: { notify: true } })
    const api = () => connectSwitch(h.control as never, normalizeProps)
    expect(api().checked).toBe(true)
    api().setChecked(false)
    expect(h.values()).toEqual({ notify: false })
    expect(api().checked).toBe(false)
  })

  it('表单还原后，控件认的原生表单重置不会把它自己的初值报出去盖掉表单的值', () => {
    // Vue 的开关曾把缺省的 defaultChecked 归一成 false：控件按「宿主声明了初值」处理原生重置，报出 false
    const h = mountBound<SwitchSchema>(switchMachine, 'notify', { defaultValues: { notify: true } }, { defaultChecked: false })
    const api = () => connectSwitch(h.control as never, normalizeProps)
    api().setChecked(false)
    expect(h.values()).toEqual({ notify: false })

    h.form.send({ type: 'RESET' })
    h.control.send({ type: 'FORM.RESET' } as never)
    expect(h.values()).toEqual({ notify: true })
    expect(api().checked).toBe(true)
  })

  it('实例给了 value 时不读也不写表单', () => {
    const h = mountBound<TextFieldSchema>(textFieldMachine, 'title', { defaultValues: { title: '表单里的' } }, { value: '实例的' })
    const api = () => connectTextField(h.control as never, normalizeProps)
    expect(api().value).toBe('实例的')
    api().setValue('改一下')
    expect(h.values()).toEqual({ title: '表单里的' })
  })
})
