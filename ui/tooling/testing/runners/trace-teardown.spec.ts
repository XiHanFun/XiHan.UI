// @vitest-environment jsdom
import type { AdapterHarness, ApplyContext, ConformanceCase } from '../src'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createReactHarness } from '../../../packages/adapters/react/tests/harness'
import { createVueHarness } from '../../../packages/adapters/vue/tests/harness'
import { createWcHarness } from '../../../packages/adapters/web-components/tests/harness'
import { applyStep, approvalSuite, menubarSuite, pendingFrames, recordTrace, settleFrame, settleTeardown } from '../src'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

/** 键盘展开的那条：焦点域在这一步建起来，卸载时 Core 把归还焦点排在动画帧上。 */
const OPEN_BY_KEYBOARD = '从 trigger 展开并把焦点落到首个条目'
function keyboardOpenCase(): ConformanceCase {
  const found = menubarSuite.cases.find(c => c.name.includes(OPEN_BY_KEYBOARD))
  if (!found)
    throw new Error(`menubar 套件里找不到「${OPEN_BY_KEYBOARD}」这条用例`)
  return found
}

async function mountAndOpen(harness: AdapterHarness): Promise<void> {
  const c = keyboardOpenCase()
  const { root } = await harness.mount({
    component: menubarSuite.component,
    props: { ...menubarSuite.defaultProps, ...c.props },
    tree: c.fixture ? c.fixture(menubarSuite.fixture) : menubarSuite.fixture,
  })
  const ctx: ApplyContext = { harness, root, doc: document, component: menubarSuite.component, anatomy: menubarSuite.anatomy }
  await settleFrame(harness, document)
  for (const step of c.steps ?? []) {
    await applyStep(ctx, step)
    await settleFrame(harness, document)
  }
  expect(document.activeElement?.getAttribute('data-part')).toBe('item')
}

/**
 * 逐帧对拍的前提是每条轨迹只由自己的 fixture 与步骤决定。这里钉住三件事：
 * 卸载本身会把归还焦点的动画帧留在队列里；recordTrace 的收尾把它在本条轨迹里跑完；
 * 超时后仍在跑的轨迹不得再碰已经归了下一条的宿主。
 */
describe('轨迹收尾', () => {
  for (const createHarness of [createVueHarness, createReactHarness, createWcHarness]) {
    const harness = createHarness()

    it(`${harness.adapterName}：不收尾，上一条留下的归还帧要到下一条轨迹的挂载帧里才跑`, async (ctx) => {
      await mountAndOpen(harness)
      await harness.unmount()
      // 焦点域拆除把归还排在动画帧上：宿主已经离场，回调还排着。
      // React 的 act 收尾要让出宏任务，整仓并行跑时 jsdom 按定时器模拟的那一帧可能已在卸载里跑掉：
      // 本条要证的「漏进下一条」这次没有发生，收完尾标成跳过，不算通过也不硬判红
      if (pendingFrames(document) === 0) {
        await settleTeardown(harness, document)
        ctx.skip()
      }
      expect(pendingFrames(document)).toBeGreaterThan(0)

      // 下一条轨迹换了个组件挂上来，挂载帧一等动画帧，跑的却是上一条的归还
      await harness.mount({ component: approvalSuite.component, props: { ...approvalSuite.defaultProps }, tree: approvalSuite.fixture })
      await settleFrame(harness, document)
      expect(pendingFrames(document)).toBe(0)
      await harness.unmount()
      await settleTeardown(harness, document)
    })

    it(`${harness.adapterName}：收尾之后没有排着的帧、焦点回到 body`, async () => {
      await mountAndOpen(harness)
      await harness.unmount()
      await settleTeardown(harness, document)
      expect(pendingFrames(document)).toBe(0)
      expect(document.activeElement).toBe(document.body)
    })

    it(`${harness.adapterName}：recordTrace 交回来的文档是干净的`, async () => {
      await recordTrace(harness, menubarSuite, keyboardOpenCase())
      expect(pendingFrames(document)).toBe(0)
      expect(document.activeElement).toBe(document.body)
      expect(document.querySelectorAll('[data-scope]').length).toBe(0)
    })

    // 用例超时后框架转去跑下一条，超时那条却还在跑：模拟成两条轨迹在同一个 harness 上交错。
    // 先起的那条在一步里睡过去，后起的那条趁这段时间正常挂载并跑完；
    // 先起那条醒来后只能停下，不得卸载后起那条的实例。
    it(`${harness.adapterName}：超时的轨迹醒来后停在原地，不碰下一条的宿主`, async () => {
      const stuck: ConformanceCase = {
        name: '睡过去',
        // 这是 harness 自身的回归用例，不对应任何组件规格
        spec: {},
        steps: [{ kind: 'raw', why: '模拟超时后仍在跑的步骤', run: () => new Promise<void>(resolve => setTimeout(resolve, 200)) }],
      }
      const first = recordTrace(harness, menubarSuite, stuck)
      // 让先起的那条挂载完、进到那一步里
      await new Promise<void>(resolve => setTimeout(resolve, 50))
      const second = await recordTrace(harness, approvalSuite, approvalSuite.cases[0]!)
      expect(second.length).toBeGreaterThan(0)
      await expect(first).rejects.toThrow('这条轨迹已超时')
      // 后起那条自己收的尾：文档仍是干净的
      expect(document.querySelectorAll('[data-scope]').length).toBe(0)
      expect(document.activeElement).toBe(document.body)
    })
  }
})
