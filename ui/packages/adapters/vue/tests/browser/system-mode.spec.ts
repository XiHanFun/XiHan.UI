// 纯 CSS 的系统档：<html data-theme="system"> 不经任何脚本（不建视觉环境控制器）跟随系统明暗。
//
// 钉住三件事：系统深色时令牌取深色块的值、color-scheme 跟着翻；系统浅色时与浅色块逐支相同；
// 皮肤里只在深色下成立的规则（语气、按钮实底）由 build 补上的系统档副本跟上，不停在浅色。
// 判据全部取计算样式；系统明暗经 Playwright 的 emulateMedia 切换。
import { afterEach, describe, expect, it } from 'vitest'
import { commands } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const SEMANTIC = ['--xh-bg-page', '--xh-bg-surface', '--xh-fg-default', '--xh-border-default', '--xh-bg-brand', '--xh-ink']

let hosts: HTMLElement[] = []

afterEach(async () => {
  for (const host of hosts) host.remove()
  hosts = []
  await commands.emulateColorScheme(null)
})

/** 一块带主题属性的区域，里面放一个语气容器，取它们的计算值。 */
function region(theme: 'light' | 'dark' | 'system'): { root: HTMLElement, tone: HTMLElement } {
  const root = document.createElement('div')
  root.dataset.theme = theme
  const tone = document.createElement('div')
  tone.dataset.tone = 'warning'
  root.append(tone)
  document.body.append(root)
  hosts.push(root)
  return { root, tone }
}

function snapshot({ root, tone }: { root: HTMLElement, tone: HTMLElement }): Record<string, string> {
  const style = getComputedStyle(root)
  return {
    'color-scheme': style.colorScheme,
    ...Object.fromEntries(SEMANTIC.map(name => [name, style.getPropertyValue(name).trim()])),
    'tone:--xh-_tone-border-control': getComputedStyle(tone).getPropertyValue('--xh-_tone-border-control').trim(),
  }
}

describe('data-theme="system"', () => {
  it('系统深色：令牌、color-scheme 与深色专属的皮肤规则都取深色', async () => {
    await commands.emulateColorScheme('dark')
    const system = snapshot(region('system'))
    expect(system['color-scheme']).toBe('dark')
    expect(system).toEqual(snapshot(region('dark')))
    expect(system).not.toEqual(snapshot(region('light')))
  })

  it('系统浅色：与浅色块逐支相同', async () => {
    await commands.emulateColorScheme('light')
    const system = snapshot(region('system'))
    expect(system['color-scheme']).toBe('light')
    expect(system).toEqual(snapshot(region('light')))
  })

  it('显式的 light / dark 不随系统变', async () => {
    await commands.emulateColorScheme('dark')
    const light = snapshot(region('light'))
    await commands.emulateColorScheme('light')
    const dark = snapshot(region('dark'))
    expect(light['color-scheme']).toBe('light')
    expect(dark['color-scheme']).toBe('dark')
    expect(snapshot(region('light'))).toEqual(light)
  })
})
