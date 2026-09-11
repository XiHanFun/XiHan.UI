// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import type { PartContract } from '../src/dom/part-contract'
import {
  DIAGNOSTIC_CODES,
  onDiagnostic,
  resetDiagnostics,
  setDiagnosticsConsoleOutput,
  setDiagnosticsLevel,
} from '@xihan-ui/core'
import { dialogAnatomy, dialogMeta } from '@xihan-ui/headless'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import manifest from '../custom-elements.json'
import { defineXhElements } from '../src/define'
import { delegatedScopesOf, isRegisteredScope } from '../src/dom/part-contract'
import { XhDialogElement } from '../src/elements/dialog'
import { XhSelectElement } from '../src/elements/select'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

interface ContractHolder { partContract?: PartContract }

/** 注册表里全部元素类，按标签名。 */
function registeredElements(): Map<string, ContractHolder> {
  const reg = (globalThis as unknown as Record<string, Map<string, { ctor: CustomElementConstructor }>>).__XIHAN_UI_WC__!
  return new Map([...reg].map(([tag, entry]) => [tag, entry.ctor as unknown as ContractHolder]))
}

let seen: DiagnosticRecord[] = []

beforeEach(() => {
  resetDiagnostics()
  setDiagnosticsConsoleOutput(false)
  setDiagnosticsLevel('warn')
  seen = []
  onDiagnostic(r => void seen.push(r))
})

afterEach(() => {
  document.body.innerHTML = ''
  resetDiagnostics()
})

function part(name: string, tag = 'div'): HTMLElement {
  const el = document.createElement(tag)
  el.dataset.xhPart = name
  return el
}

async function mountDialog(children: readonly HTMLElement[]): Promise<Updatable> {
  const el = document.createElement('xh-dialog') as Updatable
  for (const c of children) el.appendChild(c)
  document.body.appendChild(el)
  await el.updateComplete
  await el.updateComplete
  return el
}

function codes(code: string): DiagnosticRecord[] {
  return seen.filter(r => r.code === code)
}

describe('角色节点契约', () => {
  it.each(['cascader', 'tree-select'])('%s 的空态和加载态不要求虚构列项', async (component) => {
    for (const phase of ['empty', 'loading']) {
      const host = document.createElement(`xh-${component}`) as Updatable & { collection: unknown[] }
      host.collection = []
      if (phase === 'loading')
        host.setAttribute('loading', '')
      const content = part('content')
      if (component === 'tree-select')
        content.append(part('tree'))
      const state = part(phase)
      state.textContent = phase === 'empty' ? '没有数据' : '加载中'
      content.append(state)
      host.append(part('trigger', 'button'), content)
      document.body.append(host)
      await host.updateComplete
      await host.updateComplete
      expect(codes(DIAGNOSTIC_CODES.wcMissingPart)).toEqual([])
      expect(state.getAttribute('data-scope')).toBe(component)
      host.remove()
    }
  })

  it('每个元素类都声明了契约，且必需 part 落在解剖内', () => {
    const contract = XhDialogElement.partContract
    expect(contract).toBeDefined()
    expect(contract!.anatomy.name).toBe(dialogAnatomy.name)
    expect(contract!.meta).toBe(dialogMeta)
    for (const p of contract!.meta.requiredParts)
      expect(contract!.anatomy.parts).toContain(p)
  })

  it('必需 part 齐备时不投递任何诊断', async () => {
    await mountDialog([part('trigger', 'button'), part('content')])
    expect(seen).toEqual([])
  })

  it('缺必需 part 报 error 并带上 part 名与宿主节点', async () => {
    const host = await mountDialog([part('trigger', 'button')])
    const hits = codes(DIAGNOSTIC_CODES.wcMissingPart)
    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({ level: 'error', scope: 'dialog', part: 'content' })
    expect(hits[0]!.node).toBe(host)
  })

  it('解剖外的 part 名报 warn 并指向那个节点', async () => {
    const stray = part('conten')
    await mountDialog([part('trigger', 'button'), part('content'), stray])
    const hits = codes(DIAGNOSTIC_CODES.wcUnknownPart)
    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({ level: 'warn', scope: 'dialog', part: 'conten' })
    expect(hits[0]!.node).toBe(stray)
  })

  it('同一实例的同一问题重复渲染只报一次', async () => {
    const host = await mountDialog([part('trigger', 'button')])
    host.setAttribute('modal', 'false')
    await host.updateComplete
    await host.updateComplete
    expect(codes(DIAGNOSTIC_CODES.wcMissingPart)).toHaveLength(1)
  })

  it('两个坏实例各报一次', async () => {
    await mountDialog([part('trigger', 'button')])
    await mountDialog([part('trigger', 'button')])
    expect(codes(DIAGNOSTIC_CODES.wcMissingPart)).toHaveLength(2)
  })

  it('通道静默时不校验', async () => {
    setDiagnosticsLevel('silent')
    await mountDialog([part('trigger', 'button'), part('conten')])
    expect(seen).toEqual([])
  })

  it('部件标签不符时报 warn 并指向那个节点', async () => {
    const el = document.createElement('xh-field') as Updatable
    const label = part('label', 'div')
    const control = part('control', 'input')
    el.append(label, control)
    document.body.appendChild(el)
    await el.updateComplete
    await el.updateComplete

    const hits = codes(DIAGNOSTIC_CODES.wcWrongPartTag)
    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({ level: 'warn', scope: 'field', part: 'label' })
    expect(hits[0]!.node).toBe(label)
  })

  it('部件标签合规时不报', async () => {
    const el = document.createElement('xh-field') as Updatable
    el.append(part('label', 'label'), part('control', 'input'))
    document.body.appendChild(el)
    await el.updateComplete
    await el.updateComplete

    expect(codes(DIAGNOSTIC_CODES.wcWrongPartTag)).toEqual([])
  })
})

describe('委派给内嵌部件的角色节点', () => {
  /** 按 date-picker 的实际写法搭一棵：分段输入与日历的 DOM 摊在宿主自己的 Light DOM 里。 */
  async function mountDatePicker(): Promise<HTMLElement> {
    const el = document.createElement('xh-date-picker') as Updatable
    const root = part('root')
    const control = part('control')
    const segmentGroup = part('segment-group')
    segmentGroup.append(part('segment'), part('segment'), part('segment'))
    control.append(segmentGroup, part('clear-trigger', 'button'), part('trigger', 'button'))

    const calendar = part('calendar')
    const header = part('header')
    header.append(part('prev-trigger', 'button'), part('heading'), part('next-trigger', 'button'))
    const grid = part('grid')
    const gridHead = part('grid-head')
    const weekRow = part('week-row')
    weekRow.append(part('week-day', 'span'))
    gridHead.append(weekRow)
    grid.append(gridHead, part('grid-body'))
    calendar.append(header, grid)

    const content = part('content')
    content.append(calendar)
    const positioner = part('positioner')
    positioner.append(content)

    root.append(part('label', 'span'), control, part('hidden-input', 'input'), positioner)
    el.append(root)
    document.body.appendChild(el)
    await el.updateComplete
    await el.updateComplete
    return el
  }

  it('内嵌部件的角色节点不再被当成解剖外的野节点', async () => {
    await mountDatePicker()
    expect(codes(DIAGNOSTIC_CODES.wcUnknownPart)).toEqual([])
  })

  it('真正不认识的名字照报不误', async () => {
    const el = await mountDatePicker()
    el.querySelector('[data-xh-part="root"]')!.append(part('并不存在的角色'))
    await (el as Updatable).updateComplete
    await (el as Updatable).updateComplete

    const hits = codes(DIAGNOSTIC_CODES.wcUnknownPart)
    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({ scope: 'date-picker', part: '并不存在的角色' })
  })

  it('委派节点接线后戴的是内嵌部件的 scope，与宿主重名的角色归宿主', async () => {
    const el = await mountDatePicker()
    expect(el.querySelector('[data-xh-part="segment"]')!.getAttribute('data-scope')).toBe('date-field')
    expect(el.querySelector('[data-xh-part="heading"]')!.getAttribute('data-scope')).toBe('calendar')
    expect(el.querySelector('[data-xh-part="root"]')!.getAttribute('data-scope')).toBe('date-picker')
    expect(seen).toEqual([])
  })
})

describe('委派登记的核实', () => {
  it('每个元素登记的委派目标都是已注册元素的解剖名', () => {
    let delegates = 0
    for (const [tag, ctor] of registeredElements()) {
      for (const delegate of ctor.partContract?.delegates ?? []) {
        delegates++
        expect(isRegisteredScope(delegate.name), `${tag} 委派给 "${delegate.name}"`).toBe(true)
      }
    }
    expect(delegates).toBeGreaterThan(0)
  })

  it('每个元素登记的委派作者名都在它自己的 @csspart 清单里：没人写的名字不许登记', () => {
    /** 元素清单里每个标签的 @csspart 名字。 */
    const cssParts = new Map<string, Set<string>>()
    for (const mod of (manifest as { modules: { declarations?: { tagName?: string, cssParts?: { name: string }[] }[] }[] }).modules) {
      for (const decl of mod.declarations ?? []) {
        if (decl.tagName)
          cssParts.set(decl.tagName, new Set((decl.cssParts ?? []).map(p => p.name)))
      }
    }
    let checked = 0
    for (const [tag, ctor] of registeredElements()) {
      const delegates = ctor.partContract?.delegates ?? []
      if (!delegates.length)
        continue
      const documented = cssParts.get(tag)
      expect(documented, `${tag} 在 custom-elements.json 里没有 @csspart 清单`).toBeDefined()
      for (const delegate of delegates) {
        for (const part of delegate.parts) {
          checked++
          expect(documented!.has(part), `${tag} 委派给 "${delegate.name}" 的作者名 "${part}" 不在它的 @csspart 里`).toBe(true)
        }
      }
    }
    expect(checked).toBeGreaterThan(0)
  })

  it('isRegisteredScope 只认「xh-<name> 已注册且解剖名就是 name」', () => {
    expect(isRegisteredScope('tag')).toBe(true)
    expect(isRegisteredScope('并不存在')).toBe(false)
  })

  it('delegatedScopesOf 剔除与宿主重名的角色，其余按作者名归到 scope', () => {
    const table = delegatedScopesOf({
      anatomy: { name: 'host', parts: ['root', 'own'] },
      meta: { requiredParts: [] } as unknown as PartContract['meta'],
      delegates: [
        { name: 'a', parts: ['root', 'x'] },
        { name: 'b', parts: ['x', 'y'] },
      ],
    })
    expect([...table.keys()]).toEqual(['x', 'y'])
    expect([...table.get('x')!]).toEqual(['a', 'b'])
    expect([...table.get('y')!]).toEqual(['b'])
  })

  /** 按 select 多选的实际写法搭一棵，标签与删除钮由 extra 决定摆在哪。 */
  async function mountSelect(extra: (root: HTMLElement) => void): Promise<Updatable> {
    const el = document.createElement('xh-select') as Updatable
    el.setAttribute('multiple', '')
    el.setAttribute('default-value', 'a')
    const root = part('root')
    const control = part('control')
    const trigger = part('trigger', 'button')
    trigger.append(part('tag-list'), part('value-text', 'span'))
    control.append(trigger)
    const content = part('content')
    const list = part('list')
    const item = part('item', 'div')
    item.setAttribute('value', 'a')
    item.append(part('item-text', 'span'))
    list.append(item)
    content.append(list)
    const positioner = part('positioner')
    positioner.append(content)
    root.append(control, positioner)
    extra(root)
    el.append(root)
    document.body.appendChild(el)
    await el.updateComplete
    await el.updateComplete
    return el
  }

  function tagWithTrigger(): HTMLElement {
    const tag = part('tag', 'span')
    tag.setAttribute('value', 'a')
    tag.append(part('item-delete-trigger', 'button'))
    return tag
  }

  /** 临时换掉 select 的契约，跑完还回去。 */
  async function withSelectContract(contract: PartContract, run: () => Promise<void>): Promise<void> {
    const holder = XhSelectElement as unknown as { partContract: PartContract }
    const original = holder.partContract
    holder.partContract = contract
    try {
      await run()
    }
    finally {
      holder.partContract = original
    }
  }

  it('标签与删除钮放对了位置：零诊断，且戴 tag 的 scope', async () => {
    const el = await mountSelect(root => root.append(tagWithTrigger()))
    expect(el.querySelector('[data-xh-part="tag"]')!.getAttribute('data-scope')).toBe('tag')
    expect(el.querySelector('[data-xh-part="item-delete-trigger"]')!.getAttribute('data-scope')).toBe('tag')
    expect(seen).toEqual([])
  })

  it('委派目标不是已注册元素的解剖名：报 error，指向宿主，每实例一次', async () => {
    const original = XhSelectElement.partContract
    await withSelectContract({ ...original, delegates: [{ name: '并不存在的scope', parts: ['tag', 'overflow-tag', 'item-delete-trigger'] }] }, async () => {
      const host = await mountSelect(root => root.append(tagWithTrigger()))
      host.setAttribute('placeholder', '再渲一轮')
      await host.updateComplete
      await host.updateComplete

      const hits = codes(DIAGNOSTIC_CODES.invariant)
      expect(hits).toHaveLength(1)
      expect(hits[0]).toMatchObject({ level: 'error', scope: 'select', detail: { delegate: '并不存在的scope' } })
      expect(hits[0]!.node).toBe(host)
      // 目标都没注册，逐节点的核对不再重复报
      expect(seen).toHaveLength(1)
    })
  })

  it('委派目标注册了但接线给的是另一个 scope：报 error 并指向那个节点', async () => {
    const original = XhSelectElement.partContract
    await withSelectContract({ ...original, delegates: [{ name: 'badge', parts: ['tag', 'overflow-tag', 'item-delete-trigger'] }] }, async () => {
      const el = await mountSelect(root => root.append(tagWithTrigger()))
      const tag = el.querySelector('[data-xh-part="tag"]')!

      const hits = codes(DIAGNOSTIC_CODES.invariant)
      expect(hits.map(h => h.part).sort()).toEqual(['item-delete-trigger', 'tag'])
      const onTag = hits.find(h => h.part === 'tag')!
      expect(onTag).toMatchObject({ level: 'error', scope: 'select', detail: { expectedScopes: ['badge'], wiredScope: 'tag' } })
      expect(onTag.node).toBe(tag)
    })
  })

  it('tag-group：item-text 写在 item 外没被接线，报 warn 并指向那个节点', async () => {
    const el = document.createElement('xh-tag-group') as Updatable
    const root = part('root')
    const list = part('list')
    const item = part('item', 'span')
    item.setAttribute('value', 'vue')
    const cell = part('cell', 'span')
    cell.append(part('item-delete-trigger', 'button'))
    item.append(cell)
    const stray = part('item-text', 'span')
    list.append(item, stray)
    root.append(part('label', 'span'), list)
    el.append(root)
    document.body.appendChild(el)
    await el.updateComplete
    await el.updateComplete

    const hits = codes(DIAGNOSTIC_CODES.wcUnknownPart)
    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({ level: 'warn', scope: 'tag-group', part: 'item-text', detail: { expectedScopes: ['tag'], wiredScope: null } })
    expect(hits[0]!.node).toBe(stray)
    expect(codes(DIAGNOSTIC_CODES.invariant)).toEqual([])
  })

  it('tags-input：摘除钮写在 item 外没被接线，报 warn 并指向那个节点', async () => {
    const el = document.createElement('xh-tags-input') as Updatable
    el.setAttribute('default-value', 'vue')
    const root = part('root')
    const control = part('control')
    const item = part('item', 'span')
    item.setAttribute('value', 'vue')
    const preview = part('item-preview', 'span')
    preview.append(part('item-text', 'span'))
    item.append(preview, part('item-input', 'input'))
    const stray = part('item-delete-trigger', 'button')
    control.append(item, stray, part('input', 'input'), part('clear-trigger', 'button'))
    root.append(part('label', 'label'), control, part('hidden-input', 'input'))
    el.append(root)
    document.body.appendChild(el)
    await el.updateComplete
    await el.updateComplete

    const hits = codes(DIAGNOSTIC_CODES.wcUnknownPart)
    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({ level: 'warn', scope: 'tags-input', part: 'item-delete-trigger', detail: { wiredScope: null } })
    expect(hits[0]!.node).toBe(stray)
    // 放对位置的那两个没有诊断
    expect(preview.getAttribute('data-scope')).toBe('tag')
    expect(preview.querySelector('[data-xh-part="item-text"]')!.getAttribute('data-scope')).toBe('tag')
  })

  it('scroll-area：轨道与滑块戴 scrollbar 的 scope，零诊断', async () => {
    const el = document.createElement('xh-scroll-area') as Updatable
    const root = part('root')
    const viewport = part('viewport')
    viewport.append(part('content'))
    const bar = part('scrollbar')
    bar.setAttribute('orientation', 'vertical')
    const track = part('track')
    track.append(part('thumb'))
    bar.append(track)
    root.append(viewport, bar)
    el.append(root)
    document.body.appendChild(el)
    await el.updateComplete
    await el.updateComplete

    expect(track.getAttribute('data-scope')).toBe('scrollbar')
    expect(seen).toEqual([])
  })

  it('通道静默时不核对委派节点', async () => {
    setDiagnosticsLevel('silent')
    const el = document.createElement('xh-tag-group') as Updatable
    const root = part('root')
    const list = part('list')
    list.append(part('item-text', 'span'))
    root.append(list)
    el.append(root)
    document.body.appendChild(el)
    await el.updateComplete
    await el.updateComplete
    expect(seen).toEqual([])
  })
})
