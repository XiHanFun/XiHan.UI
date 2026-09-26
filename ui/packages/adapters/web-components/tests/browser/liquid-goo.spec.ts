// 液态组在 Web Components 端：色块层与滤镜是库在作者的 root 里生成的装饰节点，不参与部件契约。
// 钉住：液态档下结组；展开时动作从触发器里分离，收起时融回、落定才藏起展开组；卸载后生成的节点撤回。
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface FloatButtonElement extends HTMLElement {
  updateComplete: Promise<unknown>
}

defineXhElements()

async function settle(element: FloatButtonElement): Promise<void> {
  for (let round = 0; round < 3; round++) {
    await Promise.resolve()
    await element.updateComplete
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

beforeEach(() => {
  setDiagnosticsLevel('silent')
  document.documentElement.setAttribute('data-material', 'liquid')
})
afterEach(() => {
  document.body.innerHTML = ''
  document.documentElement.removeAttribute('data-material')
  setDiagnosticsLevel('warn')
})

it('液态档：动作从触发器里分离，收起时融回、落定才藏起展开组；卸载后色块层与滤镜撤回', async () => {
  const host = document.createElement('div')
  host.innerHTML = `<xh-float-button>
    <div data-xh-part="root">
      <button data-xh-part="trigger" aria-label="新建"></button>
      <div data-xh-part="list"><button type="button" aria-label="拍照"></button><button type="button" aria-label="上传"></button></div>
    </div>
  </xh-float-button>`
  document.body.append(host)
  const element = host.firstElementChild as FloatButtonElement
  await settle(element)
  await frames()
  const root = element.querySelector<HTMLElement>('[data-part="root"]')!
  const trigger = root.querySelector<HTMLButtonElement>('[data-part="trigger"]')!
  const list = root.querySelector<HTMLElement>('[data-part="list"]')!
  const items = [...list.children] as HTMLElement[]
  expect(root.hasAttribute('data-xh-liquid-goo')).toBe(true)
  expect(root.querySelector(':scope > [data-xh-liquid-goo-layer]')).not.toBeNull()

  trigger.click()
  await settle(element)
  await frames(2)
  expect(items.at(-1)!.style.translate).not.toBe('')
  await expect.poll(() => items.every(item => item.style.translate === ''), { timeout: 3000 }).toBe(true)

  trigger.click()
  await settle(element)
  expect(list.hidden).toBe(false)
  expect(list.inert).toBe(true)
  await expect.poll(() => getComputedStyle(list).display, { timeout: 3000 }).toBe('none')

  element.remove()
  expect(root.querySelector('[data-xh-liquid-goo-layer]')).toBeNull()
  expect(root.querySelector('[data-xh-liquid-goo-filter]')).toBeNull()
  expect(root.hasAttribute('data-xh-liquid-goo')).toBe(false)
})
