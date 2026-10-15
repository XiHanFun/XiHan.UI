// 有向图基础算法：出入度、可达性、回边反向后无环、拓扑序与找环，以及非法下标立即报错。
import type { GraphLink } from '../src/layout/graph'
import { describe, expect, it } from 'vitest'
import { isVizError } from '../src'
import { findBackLinks, findCycle, nodeDegrees, reachableFrom, topologicalOrder } from '../src/layout/graph'
import { forAll, integer } from './helpers/property'

const l = (source: number, target: number): GraphLink => ({ source, target })

function expectInvalid(run: () => unknown): void {
  let caught: unknown
  try {
    run()
  }
  catch (error) {
    caught = error
  }
  expect(isVizError(caught) && caught.code).toBe('XH_VIZ_INVALID_ARGUMENT')
}

describe('nodeDegrees', () => {
  it('自环同时算一次入度与一次出度，重复连线各算一次', () => {
    expect(nodeDegrees(3, [l(0, 1), l(0, 1), l(2, 2)])).toEqual({ incoming: [0, 2, 1], outgoing: [2, 0, 1] })
    expect(nodeDegrees(0, [])).toEqual({ incoming: [], outgoing: [] })
  })
})

describe('reachableFrom', () => {
  it('沿连线方向可达，起点自身可达', () => {
    const links = [l(0, 1), l(1, 2), l(3, 1), l(2, 0)]
    expect(reachableFrom(5, links, [0])).toEqual([true, true, true, false, false])
    expect(reachableFrom(5, links, [3, 3])).toEqual([true, true, true, true, false])
    expect(reachableFrom(5, links, [])).toEqual([false, false, false, false, false])
  })
})

describe('topologicalOrder / findCycle', () => {
  it('无环时按入度为零的下标先后出列', () => {
    expect(topologicalOrder(4, [l(2, 0), l(3, 1), l(0, 1)])).toEqual([2, 3, 0, 1])
    expect(findCycle(4, [l(2, 0), l(3, 1), l(0, 1)])).toBeUndefined()
  })

  it('有环时拓扑序为 undefined，找环给出首尾相同的节点序列', () => {
    const links = [l(0, 1), l(1, 2), l(2, 3), l(3, 1)]
    expect(topologicalOrder(4, links)).toBeUndefined()
    expect(findCycle(4, links)).toEqual([1, 2, 3, 1])
    expect(findCycle(2, [l(0, 1), l(1, 1)])).toEqual([1, 1])
    expect(topologicalOrder(1, [l(0, 0)])).toBeUndefined()
  })
})

describe('findBackLinks', () => {
  it('先从没有入线的节点出发，指向栈上节点的连线是回边，自环不算', () => {
    expect(findBackLinks(3, [l(0, 1), l(1, 2), l(2, 1), l(2, 2)])).toEqual([false, false, true, false])
    expect(findBackLinks(2, [l(1, 0), l(0, 1)])).toEqual([true, false])
    expect(findBackLinks(3, [l(1, 2), l(2, 1), l(0, 1)])).toEqual([false, true, false])
  })

  it('随机图：回边反向、去掉自环后一定无环', () => {
    forAll(200, 11, (random) => {
      const count = integer(random, 1, 12)
      return { count, links: Array.from({ length: integer(random, 0, 30) }, () => l(integer(random, 0, count - 1), integer(random, 0, count - 1))) }
    }, ({ count, links }) => {
      const back = findBackLinks(count, links)
      const forward = links.flatMap((link, i) => link.source === link.target ? [] : [back[i] ? l(link.target, link.source) : link])
      expect(topologicalOrder(count, forward)).toBeDefined()
      expect(findCycle(count, forward)).toBeUndefined()
    })
  })
})

describe('非法输入', () => {
  it('节点数与下标', () => {
    expectInvalid(() => nodeDegrees(-1, []))
    expectInvalid(() => nodeDegrees(1.5, []))
    expectInvalid(() => topologicalOrder(2, [l(0, 2)]))
    expectInvalid(() => findCycle(2, [l(-1, 0)]))
    expectInvalid(() => findBackLinks(2, [l(0, 0.5)]))
    expectInvalid(() => reachableFrom(2, [], [2]))
  })
})
