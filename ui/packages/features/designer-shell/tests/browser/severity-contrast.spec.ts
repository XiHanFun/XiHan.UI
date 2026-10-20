// 问题面板与编辑 JSON 对话框里「错误」「警告」两个字在亮色与暗色下都达到正文对比度：axe 的 AA 规则不报 color-contrast。
import type { DesignerIssueItem, XhDesignerIssuesElement, XhDesignerJsonEditorElement } from '../../src'
import { expectNoAxeViolations } from '@xihan-ui/testing/a11y'
import { afterEach, describe, it } from 'vitest'
import { defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

const AA = ['wcag2a', 'wcag2aa'] as const

const items: DesignerIssueItem[] = [
  { issue: { code: 'required', path: ['nodes', 0, 'label'] }, message: 'Node 0 needs a label' },
  { issue: { code: 'node.unreachable', path: ['nodes', 1], severity: 'warning' }, message: 'Node 1 cannot be reached' },
]

let mounted: HTMLElement[] = []

afterEach(() => {
  for (const element of mounted)
    element.remove()
  mounted = []
  document.documentElement.removeAttribute('data-theme')
})

async function frames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

/** 等进场与淡入播完：半透明途中量到的颜色不作数。 */
async function settle(): Promise<void> {
  await frames()
  const finite = document.getAnimations().filter(animation => animation.effect?.getComputedTiming().endTime !== Infinity)
  await Promise.all(finite.map(animation => animation.finished.catch(() => {})))
  await frames()
}

describe.each(['light', 'dark'] as const)('严重程度文字的对比度（%s）', (theme) => {
  it('问题面板里的「错误」「警告」', async () => {
    document.documentElement.setAttribute('data-theme', theme)
    const issues: XhDesignerIssuesElement = document.createElement('xh-designer-issues')
    issues.items = items
    // 外框里的面板铺在面底色上；单独挂时补上同一层底，暗色才不是落在白页上
    issues.style.cssText = 'display: block; inline-size: 480px; background: var(--xh-bg-surface)'
    document.body.append(issues)
    mounted.push(issues)
    await issues.updateComplete
    await settle()
    await expectNoAxeViolations(issues, { tags: AA })
  })

  it('编辑 JSON 对话框问题列表里的「错误」「警告」', async () => {
    document.documentElement.setAttribute('data-theme', theme)
    const editor: XhDesignerJsonEditorElement = document.createElement('xh-designer-json-editor')
    editor.value = { nodes: [{ id: 'n0', label: '' }, { id: 'n1', label: 'Node 1' }] }
    editor.validate = () => items
    document.body.append(editor)
    mounted.push(editor)
    editor.show()
    await editor.updateComplete
    await settle()
    await expectNoAxeViolations(document.querySelector<HTMLElement>('[data-scope="designer-json-editor"][data-part="issues"]')!, { tags: AA })
  })
})
