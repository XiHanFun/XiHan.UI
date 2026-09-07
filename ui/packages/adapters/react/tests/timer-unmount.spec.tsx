// @vitest-environment jsdom
//
// timer 起跑后在宿主里挂着两个定时器（跳数字的那一个与精确落在终点上的那一个）。
// 共用的一致性套件只在挂载态里断言，卸载之后那一段没有判据：定时器没摘干净时组件早已
// 不在页面上，回调却还在按拍调用。这里把卸载前后的拍数对起来核这一条。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhTimerRoot } from '../src'

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

/** 只在这一段里开 act 环境标记：等真实定时器的那几段不受它管，免得机器自己的更新报警告。 */
async function inAct(fn: () => void | Promise<void>): Promise<void> {
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = false
  }
}

afterEach(async () => {
  await inAct(async () => {
    root?.unmount()
  })
  host?.remove()
  root = null
  host = null
})

async function mount(tree: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await inAct(async () => {
    root!.render(tree)
  })
}

/** 等真实时钟走过这么多毫秒。 */
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('timer 卸载之后不再走', () => {
  it('拆掉组件，跳数字的那一拍就此停住', async () => {
    let ticks = 0
    const countTick = (): void => {
      ticks += 1
    }
    await mount(<XhTimerRoot autoStart interval={16} onTick={countTick} />)

    await wait(120)
    const beforeUnmount = ticks
    expect(beforeUnmount).toBeGreaterThan(0)

    await inAct(async () => {
      root?.unmount()
    })
    root = null

    await wait(160)
    expect(ticks).toBe(beforeUnmount)
  })

  it('拆掉组件，落在终点上的那一次也不再发', async () => {
    let completed = 0
    const countComplete = (): void => {
      completed += 1
    }
    await mount(
      <XhTimerRoot autoStart countdown startMs={200} onComplete={countComplete} />,
    )

    await inAct(async () => {
      root?.unmount()
    })
    root = null

    await wait(320)
    expect(completed).toBe(0)
  })
})
