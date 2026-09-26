// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { resolveScrollBehavior } from '../src/behavior/scroll-position'
import { createCounterIdGenerator } from '../src/kernel/id-generator'
import { createScope } from '../src/kernel/scope'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('resolveScrollBehavior', () => {
  const scope = (): ReturnType<typeof createScope> => createScope(document.body, createCounterIdGenerator())

  it('给了滚动目标就按它所在的作用域判断：祖先带 data-motion=reduce 时平滑降成瞬移', () => {
    const region = document.createElement('section')
    region.dataset.motion = 'reduce'
    const list = document.createElement('div')
    region.append(list)
    document.body.append(region)
    expect(resolveScrollBehavior('smooth', scope(), list)).toBe('auto')
  })

  it('作用域写 default 时即便应用别处减弱也照常平滑；不是 smooth 的原样返回', () => {
    const region = document.createElement('section')
    region.dataset.motion = 'default'
    document.body.append(region)
    expect(resolveScrollBehavior('smooth', scope(), region)).toBe('smooth')
    expect(resolveScrollBehavior('instant', scope(), region)).toBe('instant')
  })
})
