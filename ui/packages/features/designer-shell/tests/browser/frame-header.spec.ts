// 外框顶栏中段放一条命令条（各款的插入快捷钮）：放不下时命令条缩到中段的宽度，多的收进「更多」，外框不出横向溢出。
import type { DesignerCommand } from '@xihan-ui/designer-kit'
import type { XhDesignerFrameElement } from '../../src'
import { afterEach, describe, expect, it } from 'vitest'
import { createCommandToolbar, defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

let frame: XhDesignerFrameElement | undefined

afterEach(() => {
  frame?.remove()
  frame = undefined
})

async function settle(): Promise<void> {
  for (let round = 0; round < 6; round++) {
    await frame!.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

describe('外框的顶栏', () => {
  it('中段的命令条放不下时缩到中段的宽度、多的收进「更多」，外框不出横向溢出', async () => {
    frame = document.createElement('xh-designer-frame')
    frame.style.cssText = 'position:fixed;left:0;top:0;width:400px;height:480px'
    const commands = new Map<string, DesignerCommand<object>>(Array.from({ length: 10 }, (_, index) => [`insert-${index}`, { id: `insert-${index}`, label: `Insert block ${index}`, shortLabel: `Block ${index}`, placement: ['header'], run: () => {} }]))
    const bar = createCommandToolbar<object>(document, { display: 'stacked' })
    bar.element.slot = 'header-center'
    frame.append(bar.element, document.createElement('div'))
    document.body.append(frame)
    bar.update([[...commands.keys()]], commands, {}, 'Insert')
    await settle()
    expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth)
    const box = frame.getBoundingClientRect()
    const toolbar = bar.element.querySelector('xh-toolbar')!.getBoundingClientRect()
    expect([toolbar.left >= box.left - 1, toolbar.right <= box.right + 1]).toEqual([true, true])
    const more = bar.element.querySelector<HTMLElement>('[data-part="overflow-trigger"]')!
    expect(more.hidden).toBe(false)
    expect(more.getBoundingClientRect().right).toBeLessThanOrEqual(box.right + 1)
  })
})
