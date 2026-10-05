/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 把 connect 产出的 prop 字典打到 Light-DOM 角色节点上；事件每帧移旧加新，class 按词增删、不整串覆盖。

const BOOLEAN_ATTRS = new Set(['disabled', 'hidden', 'inert', 'readonly', 'required', 'checked', 'selected', 'open', 'multiple'])
const PROP_KEYS = new Set(['value', 'checked', 'selected'])

interface NodeState {
  listeners: Map<string, EventListener>
  attrs: Set<string>
}

function eventName(key: string): string | null {
  if (key.length > 2 && key.startsWith('on') && key[2]! >= 'A' && key[2]! <= 'Z')
    return key.slice(2).toLowerCase()
  return null
}

// 值相同则不写，避免多余的属性变更记录。
function setAttr(node: HTMLElement, key: string, value: string): void {
  if (node.getAttribute(key) !== value)
    node.setAttribute(key, value)
}

function removeAttr(node: HTMLElement, key: string): void {
  if (node.hasAttribute(key))
    node.removeAttribute(key)
}

export interface Spreader {
  spread: (node: HTMLElement, props: Record<string, unknown>) => void
  release: (node: HTMLElement) => void
}

/**
 * 一个角色节点当前归哪台 spreader 管，最后写它的那台就是。
 * 只有仍持有归属的那台交还时才撤属性：两台同类宿主写的属性完全同名，接管后原宿主再撤会把接管方的一起删掉。
 */
const owners = new WeakMap<Element, symbol>()

/**
 * 一个角色节点上由连接层写着的内联样式键，不分是哪一台 spreader 写的：节点被作者挪进另一台同类宿主时，
 * 接管方按这份记录撤掉前一台留下、自己不再写的那几条（拖动时写的位移一类），否则它们会一直钉在节点上。
 * 连接层给 undefined 表示「这一条我不给」：只撤写过的，作者自己写在节点上的内联样式不碰。
 */
const writtenStyles = new WeakMap<Element, Set<string>>()

/**
 * 一个角色节点上由连接层写进 class 的词（解剖带的皮肤挂载类 xh-scope-*），同样不分是哪一台 spreader 写的。
 * class 按词增删、不整串覆盖：作者写在节点上的类原样留着，只撤连接层自己写过、这一帧不再给的词。
 */
const writtenClasses = new WeakMap<Element, Set<string>>()

function classTokens(value: unknown): string[] {
  return typeof value === 'string' ? value.split(/\s+/).filter(Boolean) : []
}

function clearStyle(node: HTMLElement, key: string): void {
  if (key.startsWith('--'))
    node.style.removeProperty(key)
  else
    (node.style as unknown as Record<string, string>)[key] = ''
}

export function createSpreader(): Spreader {
  const owner = Symbol('spreader')
  const state = new WeakMap<Element, NodeState>()

  function spread(node: HTMLElement, props: Record<string, unknown>): void {
    owners.set(node, owner)
    let s = state.get(node)
    if (!s) {
      s = { listeners: new Map(), attrs: new Set() }
      state.set(node, s)
    }
    const nextAttrs = new Set<string>()
    const nextEvents = new Set<string>()
    const nextStyles = new Set<string>()
    const nextClasses = new Set<string>()

    for (const [key, value] of Object.entries(props)) {
      const ev = eventName(key)
      if (ev) {
        nextEvents.add(ev)
        const prev = s.listeners.get(ev)
        if (prev)
          node.removeEventListener(ev, prev)
        if (typeof value === 'function') {
          node.addEventListener(ev, value as EventListener)
          s.listeners.set(ev, value as EventListener)
        }
        else {
          s.listeners.delete(ev)
        }
        continue
      }
      // style 传对象时逐条写内联样式；自定义属性（--开头）走 setProperty，Object.assign 写不进去
      if (key === 'style' && value !== null && typeof value === 'object') {
        for (const [styleKey, styleValue] of Object.entries(value as Record<string, string | undefined>)) {
          // undefined 是「这一条不给」：写过的由下面的对账撤掉，没写过的（作者自己的）不碰
          if (styleValue == null)
            continue
          if (styleKey.startsWith('--')) {
            if (styleValue === '')
              node.style.removeProperty(styleKey)
            else
              node.style.setProperty(styleKey, String(styleValue))
          }
          else {
            (node.style as unknown as Record<string, unknown>)[styleKey] = styleValue
          }
          if (styleValue !== '')
            nextStyles.add(styleKey)
        }
        continue
      }
      if (key === 'class') {
        for (const token of classTokens(value)) {
          // 已在就不加：classList.add 哪怕没变也会重写一次 class 属性，留下一条多余的变更记录
          if (!node.classList.contains(token))
            node.classList.add(token)
          nextClasses.add(token)
        }
        continue
      }
      if (value === undefined || value === null || value === false) {
        // 只撤自己写过的：连接层发 undefined 表示「这一条我不给」，不是「把作者写的那条删掉」。
        // 作者在角色节点上标的 aria-label 一类，机器没写过就不该碰——碰了等于把屏幕上有名字的
        // 按钮变成读屏念不出的空按钮，而 Vue 那边（fallthrough attrs 后合并）从来不会这样。
        if (s.attrs.has(key))
          removeAttr(node, key)
        continue
      }
      nextAttrs.add(key)
      if (PROP_KEYS.has(key)) {
        (node as unknown as Record<string, unknown>)[key] = value
        continue
      }
      if (BOOLEAN_ATTRS.has(key)) {
        node.toggleAttribute(key, Boolean(value))
        continue
      }
      setAttr(node, key, String(value))
    }

    // 移除上一帧写过、这一帧不再写的属性与事件监听器。
    for (const key of s.attrs) {
      if (!nextAttrs.has(key))
        removeAttr(node, key)
    }
    for (const [ev, fn] of s.listeners) {
      if (!nextEvents.has(ev)) {
        node.removeEventListener(ev, fn)
        s.listeners.delete(ev)
      }
    }
    s.attrs = nextAttrs
    // 上一帧写着、这一帧不再给的内联样式撤掉；上一帧可能是另一台宿主写的（节点刚被挪进来）
    for (const key of writtenStyles.get(node) ?? []) {
      if (!nextStyles.has(key))
        clearStyle(node, key)
    }
    writtenStyles.set(node, nextStyles)
    for (const token of writtenClasses.get(node) ?? []) {
      if (!nextClasses.has(token))
        node.classList.remove(token)
    }
    writtenClasses.set(node, nextClasses)
  }

  function release(node: HTMLElement): void {
    const s = state.get(node)
    if (!s)
      return
    for (const [ev, fn] of s.listeners) node.removeEventListener(ev, fn)
    // 节点已被另一台宿主接管时只摘监听器，属性归接管方
    if (owners.get(node) === owner) {
      for (const key of s.attrs) node.removeAttribute(key)
      for (const key of writtenStyles.get(node) ?? []) clearStyle(node, key)
      writtenStyles.delete(node)
      for (const token of writtenClasses.get(node) ?? []) node.classList.remove(token)
      writtenClasses.delete(node)
      owners.delete(node)
    }
    state.delete(node)
  }

  return { spread, release }
}
