// @vitest-environment jsdom
import type { CascaderSchema, CascaderValue } from '../src/cascader'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { cascaderMachine, connectCascader } from '../src/cascader'

function create(props: Partial<CascaderSchema['props']> = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(cascaderMachine, { props: () => props, runtime })
  runtime.start()
  return { service, api: () => connectCascader(service, normalizeProps), stop: () => runtime.stop() }
}

describe('级联路径原生表单合同', () => {
  it.each([false, true])('multiple=%s：每路径独立 JSON 编码，不按当前候选树剔除异步初始值', (multiple) => {
    const paths = [['华东', 'a,b'], ['a', 'b,c'], ['a,b', 'c'], ['<"&', '']]
    const view = create({ name: 'paths', form: 'owner', collection: [], multiple, defaultValue: multiple ? paths : paths[0] })
    try {
      const expected = multiple ? paths : [paths[0]]
      const fields = view.api().value.map(path => view.api().getHiddenInputProps({ path }))
      expect(fields.map(field => JSON.parse(field.value as string))).toEqual(expected)
      expect(fields.every(field => field.type === 'hidden' && field.name === 'paths' && field.form === 'owner')).toBe(true)
      view.api().setValue([])
      expect(view.api().value).toEqual([])
    }
    finally { view.stop() }
  })

  it('禁用排除提交，只读已选值保留', () => {
    const props = { defaultValue: ['华东', 'a,b'], disabled: true, readOnly: true }
    const view = create(props)
    try {
      expect(view.api().getHiddenInputProps({ path: props.defaultValue }).disabled).toBe(true)
      props.disabled = false
      expect(view.api().getHiddenInputProps({ path: props.defaultValue }).disabled).toBeUndefined()
    }
    finally { view.stop() }
  })

  it('展开时重置值，不擅自关闭浮层或移除正在浏览的路径', () => {
    const onOpenChange = vi.fn()
    const view = create({
      defaultValue: ['a', 'b'],
      defaultOpen: true,
      onOpenChange,
      collection: [{ value: 'a', children: [{ value: 'b' }, { value: 'c' }] }],
    })
    try {
      view.api().setValue([['a', 'c']])
      view.api().setActivePath(['a'])
      view.service.send({ type: 'ITEM.FOCUS', level: 1, value: 'c' })
      const focused = view.api().focusedPath
      view.service.send({ type: 'FORM.RESET' })
      expect(view.api().value).toEqual([['a', 'b']])
      expect(view.api().open).toBe(true)
      expect(view.api().focusedPath).toEqual(focused)
      expect(onOpenChange).not.toHaveBeenCalled()
    }
    finally { view.stop() }
  })

  it('受控无默认值不通知，有默认值只发送重置意图', () => {
    const onValueChange = vi.fn()
    const props: Partial<CascaderSchema['props']> = { value: ['a'], onValueChange }
    const view = create(props)
    try {
      view.service.send({ type: 'FORM.RESET' })
      expect(onValueChange).not.toHaveBeenCalled()
      props.defaultValue = ['华东', 'a,b']
      view.service.send({ type: 'FORM.RESET' })
      expect(onValueChange).toHaveBeenLastCalledWith({ value: [['华东', 'a,b']] })
      expect(view.api().value).toEqual([['a']])
    }
    finally { view.stop() }
  })

  const invalidValues = ['a,b', null, [[]], [['a'], 'b'], ['a', ['b']], [[1]], [['a', undefined]]]
  for (const prop of ['value', 'defaultValue'] as const) {
    it.each(invalidValues.map((value, index) => [index, value]))(`${prop} 拒绝非法结构 #%s`, (_, value) => {
      expect(() => {
        const view = create({ [prop]: value as CascaderValue })
        try {
          view.api()
        }
        finally { view.stop() }
      }).toThrow(/Cascader/)
    })
  }

  it('命令赋值与单路径选择拒绝非法结构，不截断或展开字符修复', () => {
    const view = create({ defaultValue: ['original'] })
    try {
      for (const invalid of ['a,b', [['a'], []], [['a'], 'b'], [[1]], [['a', undefined]]]) {
        expect(() => view.api().setValue(invalid as string[][])).toThrow(/Cascader/)
        expect(view.api().value).toEqual([['original']])
      }
      // 模拟 JavaScript 调用方绕过类型系统送入的非法数据。
      for (const path of [[], 'a,b', [null]] as unknown[]) {
        expect(() => view.api().select(path as string[])).toThrow(/Cascader/)
        expect(() => view.api().getHiddenInputProps({ path: path as string[] })).toThrow(/Cascader/)
      }
    }
    finally { view.stop() }
  })
})
