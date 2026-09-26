// 液态组在 React 端：色块层与滤镜是 core 在根节点里生成的装饰节点，React 不管它们。
// 钉住：液态档下结组；展开时动作从触发器里分离，收起时融回、落定才藏起展开组；卸载后生成的节点撤回。
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, it } from 'vitest'
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
let root: Root | null = null
let host: HTMLElement | null = null

async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

function frames(count = 3) {
  return new Promise<void>((resolve) => {
    const step = (left: number): void => {
      if (left === 0)
        resolve()
      else requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

afterEach(async () => {
  if (root)
    await inAct(() => root!.unmount())
  root = null
  host?.remove()
  host = null
  document.documentElement.removeAttribute('data-material')
})

it('液态档：动作从触发器里分离，收起时融回、落定才藏起展开组；卸载后色块层与滤镜撤回', async () => {
  document.documentElement.setAttribute('data-material', 'liquid')
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(
    <XhFloatButtonRoot>
      <XhFloatButtonTrigger aria-label="新建" />
      <XhFloatButtonList>
        <button type="button" aria-label="拍照" />
        <button type="button" aria-label="上传" />
      </XhFloatButtonList>
    </XhFloatButtonRoot>,
  ))
  await frames()
  const fab = host.querySelector<HTMLElement>('[data-scope="float-button"][data-part="root"]')!
  const trigger = fab.querySelector<HTMLButtonElement>('[data-part="trigger"]')!
  const list = fab.querySelector<HTMLElement>('[data-part="list"]')!
  const items = [...list.children] as HTMLElement[]
  expect(fab.hasAttribute('data-xh-liquid-goo')).toBe(true)
  expect(fab.querySelector(':scope > [data-xh-liquid-goo-layer]')).not.toBeNull()

  await inAct(() => trigger.click())
  await frames(2)
  expect(items.at(-1)!.style.translate).not.toBe('')
  await expect.poll(() => items.every(item => item.style.translate === ''), { timeout: 3000 }).toBe(true)

  await inAct(() => trigger.click())
  expect(list.hidden).toBe(false)
  expect(list.inert).toBe(true)
  await expect.poll(() => list.hidden, { timeout: 3000 }).toBe(true)

  await inAct(() => root!.unmount())
  root = null
  expect(fab.querySelector('[data-xh-liquid-goo-layer]')).toBeNull()
  expect(fab.hasAttribute('data-xh-liquid-goo')).toBe(false)
})
