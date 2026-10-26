/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 首次交互：文档上第一次有人动（指针移进来、按下、按键、聚焦、触摸）时跑一批任务。
//
// 按需块的预取挂在这里：首屏不下载，用户一开始操作就在后台取。键盘打开浮层之前焦点一定先到，
// 指针点开之前也一定先移进来，所以真要打开时多半已经到了。

/** 算作开始交互的事件：都在捕获阶段被动监听，不拦也不改任何东西。 */
const INTERACTION_EVENTS = ['pointerover', 'pointerdown', 'keydown', 'focusin', 'touchstart'] as const

/** 每个文档还在等的任务；已经交互过记 true，之后登记的任务当场跑。 */
const pending = new WeakMap<Document, Set<() => void> | true>()

/**
 * 文档上第一次有交互时调用 run；已经交互过就当场调用。同一个函数在同一个文档上只排一次，
 * 几十个浮层各登记一次也只跑一遍。一次交互之后监听全部撤掉，之后不再有任何开销。
 */
export function onFirstInteraction(doc: Document, run: () => void): void {
  const state = pending.get(doc)
  if (state === true) {
    run()
    return
  }
  if (state) {
    state.add(run)
    return
  }
  const queue = new Set([run])
  pending.set(doc, queue)
  const fire = (): void => {
    for (const type of INTERACTION_EVENTS)
      doc.removeEventListener(type, fire, true)
    pending.set(doc, true)
    for (const task of queue)
      task()
  }
  for (const type of INTERACTION_EVENTS)
    doc.addEventListener(type, fire, { capture: true, passive: true })
}
