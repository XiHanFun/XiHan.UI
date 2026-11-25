import type { PresenceApi, PresenceProps } from '../src/presence'
import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
// 直接从组件目录导入，不经包主入口
import { connectPresence, presenceAnatomy, presenceKeyboard, presenceMeta } from '../src/presence'

type Dict = Record<string, unknown>

/** 用给定 props 调一次连接层，返回其 API。 */
function api(props: PresenceProps = {}): PresenceApi {
  return connectPresence(props, normalizeProps)
}

/** 这一帧内容挂不挂：四种组合按 [visible, mountedOnce] 排开。 */
function mounts(props: PresenceProps): Record<string, boolean> {
  const current = api(props)
  return {
    'visible': current.isContentMounted(true, false),
    'visible+once': current.isContentMounted(true, true),
    'hidden': current.isContentMounted(false, false),
    'hidden+once': current.isContentMounted(false, true),
  }
}

describe('presence 契约', () => {
  it('解剖只有 root，键盘表为空，元数据只要求 root', () => {
    expect(presenceAnatomy.name).toBe('presence')
    expect(presenceAnatomy.parts).toEqual(['root'])
    expect(presenceKeyboard.rows).toEqual([])
    expect(presenceMeta.requiredParts).toEqual(['root'])
  })
})

describe('connectPresence 的 present', () => {
  it('缺省不在场', () => {
    expect(api().present).toBe(false)
  })

  it('照实投影 present，非布尔的真值收成 true', () => {
    expect(api({ present: true }).present).toBe(true)
    expect(api({ present: 1 as unknown as boolean }).present).toBe(true)
    expect(api({ present: undefined }).present).toBe(false)
  })
})

describe('connectPresence 的 isContentMounted', () => {
  it('缺省（lazyMount、unmountOnExit 都为真）：只在可见时挂着，没在场过与退场播完都不挂', () => {
    expect(mounts({})).toEqual({ 'visible': true, 'visible+once': true, 'hidden': false, 'hidden+once': false })
  })

  it('unmountOnExit 为 false：在场过一次之后不可见也留着；第一次在场之前仍由 lazyMount 拦着', () => {
    expect(mounts({ unmountOnExit: false })).toEqual({ 'visible': true, 'visible+once': true, 'hidden': false, 'hidden+once': true })
  })

  it('lazyMount 为 false、unmountOnExit 仍为真：不可见就不挂，在场过与否不影响', () => {
    expect(mounts({ lazyMount: false })).toEqual({ 'visible': true, 'visible+once': true, 'hidden': false, 'hidden+once': false })
  })

  it('两者都为 false：内容一直挂着', () => {
    expect(mounts({ lazyMount: false, unmountOnExit: false })).toEqual({ 'visible': true, 'visible+once': true, 'hidden': true, 'hidden+once': true })
  })

  it('可见即挂，不看 present：退场那一段 present 已为假，内容仍要留到动画播完', () => {
    expect(api({ present: false }).isContentMounted(true, true)).toBe(true)
  })
})

describe('connectPresence 的 getRootProps', () => {
  it('在场且可见：data-state=open，不带 hidden，带 scope 与 part', () => {
    const root = api({ present: true }).getRootProps(true, true) as Dict
    expect(root['data-scope']).toBe('presence')
    expect(root['data-part']).toBe('root')
    expect(root['data-state']).toBe('open')
    expect(root.hidden).toBeUndefined()
  })

  it('退场那一段（不在场、仍可见）：data-state=closed，不带 hidden', () => {
    const root = api({ present: false }).getRootProps(true, true) as Dict
    expect(root['data-state']).toBe('closed')
    expect(root.hidden).toBeUndefined()
  })

  it('退场播完（不在场、不可见）：data-state=closed，带 hidden', () => {
    const root = api({ present: false }).getRootProps(false, true) as Dict
    expect(root['data-state']).toBe('closed')
    expect(root.hidden).toBe(true)
  })

  it('present 没变过时首帧就在场的根带 data-instant，变过之后不带', () => {
    expect((api({ present: true }).getRootProps(true, false) as Dict)['data-instant']).toBe('')
    expect((api({ present: true }).getRootProps(true, true) as Dict)['data-instant']).toBeUndefined()
    expect((api({ present: false }).getRootProps(false, false) as Dict)['data-instant']).toBeUndefined()
  })

  it('不在场即 inert：退场那一段内容还看得见，焦点与读屏已经让开', () => {
    expect((api({ present: false }).getRootProps(true, true) as Dict).inert).toBe(true)
    expect((api({ present: true }).getRootProps(true, true) as Dict).inert).toBeUndefined()
  })

  it('不写 role：里面是什么由作者决定，它只管进出场', () => {
    const root = api({ present: true }).getRootProps(true, true) as Dict
    expect(root.role).toBeUndefined()
    expect(root['aria-hidden']).toBeUndefined()
  })
})
