// @vitest-environment jsdom
// 非 Boolean 的 default: undefined 清理必须是运行时等价变换；这里不调用原组件 setup，
// 只让 Vue 用每个组件的真实 props 表解析「缺席」与「显式 undefined」，并输出稳定摘要供 A/B 对拍。
import type { ComponentObjectPropsOptions } from 'vue'
import { createHash } from 'node:crypto'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import * as adapter from '../src/index'

interface ComponentOptions {
  props?: string[] | ComponentObjectPropsOptions
}

function hasBooleanType(type: unknown): boolean {
  return type === Boolean || (Array.isArray(type) && type.includes(Boolean))
}

function canonical(value: unknown): string {
  if (value === undefined)
    return 'undefined'
  if (value === null)
    return 'null'
  if (Array.isArray(value))
    return `array:${JSON.stringify(value)}`
  if (typeof value === 'object')
    return `object:${JSON.stringify(value)}`
  return `${typeof value}:${String(value)}`
}

describe('vue props undefined default 运行时合同', () => {
  it('全部组件的缺席/显式 undefined 解析稳定，Boolean 转换单独守住', async () => {
    const rows: Array<{ component: string, prop: string, absent: string, explicit: string }> = []
    const seen = new Set<unknown>()

    for (const [exportName, value] of Object.entries(adapter).sort(([a], [b]) => a.localeCompare(b))) {
      if (!value || typeof value !== 'object' || seen.has(value))
        continue
      const props = (value as ComponentOptions).props
      if (!props || Array.isArray(props))
        continue
      seen.add(value)
      const names = Object.keys(props).sort()
      let current: Record<string, unknown> = {}
      const Probe = defineComponent({
        name: `${exportName}PropsProbe`,
        props,
        setup(resolved) {
          return () => {
            const values = resolved as Record<string, unknown>
            current = Object.fromEntries(names.map(name => [name, values[name]]))
            return h('div')
          }
        },
      })
      const wrapper = mount(Probe, { global: { config: { warnHandler: () => {} } } })
      await nextTick()
      const absent = { ...current }
      await wrapper.setProps(Object.fromEntries(names.map(name => [name, undefined])))
      await nextTick()
      const explicit = { ...current }
      wrapper.unmount()

      for (const name of names) {
        const option = props[name]
        const optionObject = option && typeof option === 'object' && !Array.isArray(option)
          ? option as { type?: unknown, default?: unknown }
          : null
        const boolean = hasBooleanType(optionObject?.type ?? option)
        const hasDefault = optionObject !== null && Object.hasOwn(optionObject, 'default')
        if (!boolean || hasDefault)
          expect(explicit[name], `${exportName}.${name}`).toEqual(absent[name])
        else
          expect(absent[name], `${exportName}.${name}`).toBe(false)
        rows.push({
          component: exportName,
          prop: name,
          absent: canonical(absent[name]),
          explicit: canonical(explicit[name]),
        })
      }
    }

    expect(rows.length).toBeGreaterThan(1000)
    const digest = createHash('sha256').update(JSON.stringify(rows)).digest('hex')
    process.stdout.write(`[vue-prop-runtime] ${rows.length} props sha256=${digest}\n`)
  })
})
