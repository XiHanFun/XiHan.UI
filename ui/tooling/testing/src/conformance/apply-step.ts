import type { Anatomy } from '@xihan-ui/kernel'
import type { AdapterHarness, ModifierKey, PartRef, SettleCondition, Step } from './types'

export interface ApplyContext {
  readonly harness: AdapterHarness
  readonly root: HTMLElement
  readonly doc: Document
  readonly component: string
  readonly anatomy: Anatomy<string>
}

interface ParsedRef {
  readonly part: string
  readonly index: number
}

function parseRef(ref: PartRef): ParsedRef {
  const m = /^(.+?)\[(\d+)\]$/.exec(ref)
  return m ? { part: m[1]!, index: Number(m[2]) } : { part: ref, index: 0 }
}

function findPartElement(ctx: ApplyContext, ref: PartRef): HTMLElement | null {
  const { part, index } = parseRef(ref)
  const els = ctx.doc.querySelectorAll<HTMLElement>(
    `[data-scope="${ctx.component}"][data-part="${part}"]`,
  )
  return els[index] ?? null
}

function requirePart(ctx: ApplyContext, ref: PartRef): HTMLElement {
  const el = findPartElement(ctx, ref)
  if (!el)
    throw new Error(`步骤目标 part 不存在：${ref}`)
  return el
}

function modifierFlags(mods: readonly ModifierKey[] = []): Record<string, boolean> {
  return {
    shiftKey: mods.includes('Shift'),
    ctrlKey: mods.includes('Control'),
    altKey: mods.includes('Alt'),
    metaKey: mods.includes('Meta'),
  }
}

function keyInit(key: string, mods?: readonly ModifierKey[], composing?: boolean): KeyboardEventInit {
  const value = key === 'Space' ? ' ' : key
  const code = key === 'Space' ? 'Space' : key.length === 1 ? `Key${key.toUpperCase()}` : key
  const init: KeyboardEventInit = { key: value, code, bubbles: true, cancelable: true, ...modifierFlags(mods) }
  // 两个信号都给：不上报 isComposing 的输入法只把 keyCode 打成 229
  return composing ? { ...init, isComposing: true, keyCode: 229 } : init
}

function dispatchKey(target: EventTarget, key: string, mods?: readonly ModifierKey[], composing?: boolean): void {
  const init = keyInit(key, mods, composing)
  target.dispatchEvent(new KeyboardEvent('keydown', init))
  // 组合期间浏览器不派 keyup，照实模拟
  if (!composing)
    target.dispatchEvent(new KeyboardEvent('keyup', init))
}

function checkSettle(ctx: ApplyContext, cond: SettleCondition): boolean {
  if ('present' in cond)
    return findPartElement(ctx, cond.present) != null
  if ('absent' in cond)
    return findPartElement(ctx, cond.absent) == null
  if ('activeElement' in cond) {
    const el = findPartElement(ctx, cond.activeElement)
    const ae = ctx.doc.activeElement
    return !!el && !!ae && (el === ae || el.contains(ae))
  }
  // attr 条件
  const el = findPartElement(ctx, cond.attr.part)
  const actual = el ? el.getAttribute(cond.attr.name) : null
  return actual === cond.attr.value
}

/** 条件盯着哪个部件。 */
function refOf(cond: SettleCondition): PartRef {
  if ('present' in cond)
    return cond.present
  if ('absent' in cond)
    return cond.absent
  if ('activeElement' in cond)
    return cond.activeElement
  return cond.attr.part
}

/** 部件身上的 data-* 与 hidden，状态都写在这些属性上。 */
function stateAttrs(el: Element): string {
  return Array.from(el.attributes)
    .filter(a => a.name.startsWith('data-') || a.name === 'hidden')
    .map(a => `${a.name}="${a.value}"`)
    .join(' ')
}

/** 超时那一刻的实况：同名部件有几个、盯的那个现在什么样、root 什么样。 */
function describeSettle(ctx: ApplyContext, cond: SettleCondition): string {
  const { part, index } = parseRef(refOf(cond))
  const els = ctx.doc.querySelectorAll<HTMLElement>(
    `[data-scope="${ctx.component}"][data-part="${part}"]`,
  )
  const el = els[index] ?? null
  const lines = [`文档里 ${part} 共 ${els.length} 个，条件盯的是第 ${index} 个${el ? '' : '（不存在）'}`]
  if (el)
    lines.push(`它现在是：${stateAttrs(el)}`)
  if ('activeElement' in cond) {
    const ae = ctx.doc.activeElement
    lines.push(`焦点在：${ae ? `<${ae.tagName.toLowerCase()} ${stateAttrs(ae)}>` : '（无）'}`)
  }
  const root = ctx.doc.querySelector(`[data-scope="${ctx.component}"][data-part="root"]`)
  if (root && root !== el)
    lines.push(`root 现在是：${stateAttrs(root)}`)
  return lines.join('；')
}

async function settle(ctx: ApplyContext, cond: SettleCondition, timeoutMs = 1000): Promise<void> {
  const rounds = Math.max(1, Math.ceil(timeoutMs / 10))
  const started = performance.now()
  for (let i = 0; i < rounds; i++) {
    await ctx.harness.flush()
    if (checkSettle(ctx, cond))
      return
    await new Promise<void>(r => setTimeout(r, 10))
  }
  await ctx.harness.flush()
  if (!checkSettle(ctx, cond)) {
    // 实况一起报出来：只说"没到终态"分不清是状态没动还是循环被饿着了
    const waited = Math.round(performance.now() - started)
    throw new Error(
      `settle 超时未满足条件：${JSON.stringify(cond)}；轮询 ${rounds} 轮共 ${waited}ms；${describeSettle(ctx, cond)}`,
    )
  }
}

/** 把一个声明式步骤翻译成真实 DOM 交互（jsdom 环境）。 */
export async function applyStep(ctx: ApplyContext, step: Step): Promise<void> {
  switch (step.kind) {
    case 'click': {
      const el = requirePart(ctx, step.part)
      el.focus?.()
      if (step.modifiers?.length)
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...modifierFlags(step.modifiers) }))
      else
        el.click()
      break
    }
    case 'dblclick': {
      const el = requirePart(ctx, step.part)
      el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))
      break
    }
    // 每一下都重新取当下持有焦点的元素
    case 'key': {
      for (let i = 0; i < (step.repeat ?? 1); i++)
        dispatchKey(ctx.doc.activeElement ?? ctx.doc.body, step.key, step.modifiers, step.composing)
      break
    }
    case 'type': {
      for (const ch of step.text)
        dispatchKey(ctx.doc.activeElement ?? ctx.doc.body, ch)
      break
    }
    case 'focus': {
      requirePart(ctx, step.part).focus?.()
      break
    }
    case 'blur': {
      (ctx.doc.activeElement as HTMLElement | null)?.blur?.()
      break
    }
    case 'outside': {
      const body = ctx.doc.body
      if (step.action === 'click') {
        body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }))
        body.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      }
      else if (step.action === 'focus') {
        body.focus?.()
      }
      else {
        dispatchKey(body, step.key ?? 'Escape')
      }
      break
    }
    case 'setProps': {
      await ctx.harness.setProps(step.props)
      break
    }
    case 'settle': {
      await settle(ctx, step.until, step.timeoutMs)
      break
    }
    case 'raw': {
      await step.run({
        root: ctx.root,
        doc: ctx.doc,
        adapterName: ctx.harness.adapterName,
        flush: () => ctx.harness.flush(),
      })
      break
    }
  }
}
