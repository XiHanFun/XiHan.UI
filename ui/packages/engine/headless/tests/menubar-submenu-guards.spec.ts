// @vitest-environment jsdom
// 菜单栏要能容下子菜单：带 aria-haspopup 的条目是子菜单入口，不是可选中的条目；
// 子层处理掉的键不再由本层接管；焦点走进子菜单不算离场。
import type { MenubarSchema } from '../src/menubar'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { connectMenubar, menubarMachine } from '../src/menubar'

const collection = [
  { value: 'file', label: '文件', items: [{ value: 'open', label: '打开' }, { value: 'share', label: '发送到' }] },
]

function menubar(props: Partial<MenubarSchema['props']> = {}) {
  const runtime = createVanillaRuntime()
  const onSelect = vi.fn()
  const service = createService(menubarMachine, {
    props: () => ({ collection, defaultValue: 'file', onSelect, ...props }),
    runtime,
  })
  runtime.start()
  return { onSelect, api: () => connectMenubar(service, normalizeProps) }
}

describe('子菜单入口不当普通条目', () => {
  it('点子菜单入口不发选中——它自己管展开', () => {
    const { onSelect, api } = menubar()
    const props = api().getItemProps({ value: 'share' }) as Record<string, unknown>
    const el = document.createElement('div')
    el.setAttribute('aria-haspopup', 'menu')
    ;(props.onClick as (e: unknown) => void)({ currentTarget: el })
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('普通条目照常发选中', () => {
    const { onSelect, api } = menubar()
    const props = api().getItemProps({ value: 'open' }) as Record<string, unknown>
    ;(props.onClick as (e: unknown) => void)({ currentTarget: document.createElement('div') })
    expect(onSelect).toHaveBeenCalled()
  })
})

describe('子层处理过的键不再接管', () => {
  it('defaultPrevented 的按键直接放行', () => {
    const { api } = menubar()
    const content = api().getContentProps({ value: 'file' }) as Record<string, unknown>
    const target = document.createElement('div')
    const preventDefault = vi.fn()
    // 子菜单已经吃掉这一下（例如它的收回键），本层不该再动
    ;(content.onKeyDown as (e: unknown) => void)({
      key: 'ArrowDown',
      defaultPrevented: true,
      currentTarget: target,
      target,
      preventDefault,
    })
    expect(preventDefault).not.toHaveBeenCalled()
  })
})
