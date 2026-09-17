// @vitest-environment jsdom
//
// 组的 variant / tone / size 按整组禁用同一条路写到每个 <xh-button> 段上：段自己没写的取组值，
// 写了的优先，组换值时盖不掉作者写的；段因此自带 data-xh-action-variant，颜色由家族形态矩阵给出。
// 共享的一致性套件核不到这一路：它的 fixture 里每一段是裸 <button>，不经过 <xh-button>。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface UpdatableGroup extends HTMLElement {
  variant?: string
  tone?: string
  size?: string
  updateComplete: Promise<unknown>
}

async function settle(host: UpdatableGroup): Promise<void> {
  await host.updateComplete
  // 段是独立宿主：组把属性写上去之后，段自己还要再走一轮更新才投影到角色节点
  for (const segment of host.querySelectorAll<UpdatableGroup>('xh-button'))
    await segment.updateComplete
  await host.updateComplete
}

function mountGroup(attrs: Record<string, string>, own: Record<string, string> = {}): UpdatableGroup {
  const host = document.createElement('xh-button-group') as UpdatableGroup
  for (const [key, value] of Object.entries(attrs))
    host.setAttribute(key, value)
  const root = document.createElement('div')
  root.dataset.xhPart = 'root'
  for (const [label, segmentAttrs] of [['继承组', {}], ['自写', own]] as const) {
    const segment = document.createElement('xh-button')
    for (const [key, value] of Object.entries(segmentAttrs))
      segment.setAttribute(key, value)
    const button = document.createElement('button')
    button.dataset.xhPart = 'root'
    button.textContent = label
    segment.append(button)
    root.append(segment)
  }
  host.append(root)
  document.body.append(host)
  return host
}

function roots(host: HTMLElement): HTMLButtonElement[] {
  return [...host.querySelectorAll<HTMLButtonElement>('[data-scope="button"][data-part="root"]')]
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('按钮组的三轴下发到组内每一段', () => {
  it('组写了 variant / tone / size：未自写的段取组值，自写的段优先', async () => {
    const host = mountGroup({ variant: 'outline', tone: 'danger', size: 'sm' }, { variant: 'solid', tone: 'brand', size: 'lg' })
    await settle(host)
    const [inherited, own] = roots(host)
    expect(inherited!.getAttribute('data-xh-action-variant')).toBe('outline')
    expect(inherited!.getAttribute('data-variant')).toBe('outline')
    expect(inherited!.getAttribute('data-tone')).toBe('danger')
    expect(inherited!.getAttribute('data-size')).toBe('sm')
    expect(inherited!.getAttribute('data-xh-action-size')).toBe('sm')
    expect(own!.getAttribute('data-xh-action-variant')).toBe('solid')
    expect(own!.getAttribute('data-tone')).toBe('brand')
    expect(own!.getAttribute('data-size')).toBe('lg')
  })

  it('组没写 variant：段落组的缺省 subtle；组换值后未自写的段跟着换，自写的段不动', async () => {
    const host = mountGroup({}, { variant: 'ghost' })
    await settle(host)
    const [inherited, own] = roots(host)
    expect(inherited!.getAttribute('data-xh-action-variant')).toBe('subtle')
    expect(inherited!.getAttribute('data-tone')).toBeNull()
    expect(own!.getAttribute('data-xh-action-variant')).toBe('ghost')

    host.setAttribute('variant', 'solid')
    host.setAttribute('tone', 'success')
    await settle(host)
    expect(inherited!.getAttribute('data-xh-action-variant')).toBe('solid')
    expect(inherited!.getAttribute('data-tone')).toBe('success')
    expect(own!.getAttribute('data-xh-action-variant')).toBe('ghost')
    expect(own!.getAttribute('data-tone')).toBe('success')

    host.removeAttribute('tone')
    await settle(host)
    expect(inherited!.getAttribute('data-tone')).toBeNull()
  })

  it('作者放进组里的裸 <button> 不是本库的段，不被写属性', async () => {
    const host = document.createElement('xh-button-group') as UpdatableGroup
    host.setAttribute('variant', 'outline')
    const root = document.createElement('div')
    root.dataset.xhPart = 'root'
    const plain = document.createElement('button')
    plain.textContent = '裸按钮'
    root.append(plain)
    host.append(root)
    document.body.append(host)
    await host.updateComplete
    expect(plain.hasAttribute('variant')).toBe(false)
  })
})
