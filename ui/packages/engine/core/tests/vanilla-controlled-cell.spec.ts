import { describe, expect, it } from 'vitest'
import { createVanillaRuntime } from '../src/machine/reactive/vanilla'

/**
 * 受控 cell 的值由宿主从外面写进来，根本不经过 cell.set。
 * 版本号若按"被 set 了几次"记，受控值再怎么变版本号都停在 0，
 * 于是 track([context.dep(k)]) 在这个运行时上静默不触发——
 * 同一份 headless 换个运行时行为就变了。
 * Vue 与 WC 两个运行时都是按值拉取比对的，vanilla 得跟上。
 */
describe('vanilla 运行时的受控 cell', () => {
  it('受控值从外部改变时版本号递增', () => {
    const rt = createVanillaRuntime()
    let controlled = 'a'
    const c = rt.cell<string>(() => ({ value: controlled, defaultValue: 'a' }))

    const v0 = c.version()
    expect(c.get()).toBe('a')

    controlled = 'b'
    expect(c.get()).toBe('b')
    expect(c.version()).toBeGreaterThan(v0)
  })

  it('受控值没变时版本号不动（别把它变成每读一次就加一）', () => {
    const rt = createVanillaRuntime()
    const c = rt.cell<string>(() => ({ value: 'x', defaultValue: 'x' }))
    const v0 = c.version()
    c.version()
    expect(c.version()).toBe(v0)
  })

  it('非受控 cell 走 set 时版本号照样递增', () => {
    const rt = createVanillaRuntime()
    const c = rt.cell<number>(() => ({ defaultValue: 1 }))
    const v0 = c.version()
    c.set(2)
    expect(c.get()).toBe(2)
    expect(c.version()).toBeGreaterThan(v0)
  })

  it('受控 cell 的 set 不改内部值，但仍要通知宿主（onChange）', () => {
    const rt = createVanillaRuntime()
    const seen: string[] = []
    const c = rt.cell<string>(() => ({
      value: 'locked',
      defaultValue: 'locked',
      onChange: next => seen.push(next),
    }))
    c.set('tried')
    // 受控：界面不许自作主张，值仍是宿主给的那个
    expect(c.get()).toBe('locked')
    // 但意图要送出去，否则宿主永远不知道用户想改
    expect(seen).toEqual(['tried'])
  })
})
