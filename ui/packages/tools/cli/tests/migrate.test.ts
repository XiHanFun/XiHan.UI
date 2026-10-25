import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { runCli } from '../src/cli'
import { dialectOf, migrateSource } from '../src/migrate'
import { migrationsBetween } from '../src/migrations'

const V5 = migrationsBetween(4, 5)
const UI = fileURLToPath(new URL('../../../../', import.meta.url))
const DEMOS = join(UI, '..', 'docs', '.vitepress', 'demos')
const REACT = join(UI, 'packages', 'adapters', 'react')

describe('migrate：4.x → 5.0', () => {
  it('导入搬家与改名：颜色、快捷键改从 core 引入，令牌的颜色函数换新名，没起别名的用处一起改', () => {
    const source = [
      `import type { HeatmapCellDetails } from '@xihan-ui/headless'`,
      `import { colorParse, connectHeatmap, formatHotkey } from '@xihan-ui/headless'`,
      `import { type Oklch, parseColorToOklch } from '@xihan-ui/tokens'`,
      `const c: Oklch | null = parseColorToOklch('red')`,
      `export const f = (d: HeatmapCellDetails) => [d, c, colorParse('#fff'), formatHotkey('mod+k'), connectHeatmap]`,
    ].join('\n')
    const { text } = migrateSource(source, 'script', V5)
    expect(text).toBe([
      `import type { HeatmapDatumDetails } from '@xihan-ui/headless'`,
      `import { connectHeatmap } from '@xihan-ui/headless'`,
      `import { formatHotkey } from '@xihan-ui/core/hotkey'`,
      `import { colorParse } from '@xihan-ui/core/color'`,
      `import { type ColorOklch, colorParseOklch } from '@xihan-ui/core/color'`,
      `const c: ColorOklch | null = colorParseOklch('red')`,
      `export const f = (d: HeatmapDatumDetails) => [d, c, colorParse('#fff'), formatHotkey('mod+k'), connectHeatmap]`,
    ].join('\n'))
  })

  it('jSX：事件按组件改名，布尔开关换成取值，写了表达式的报出来', () => {
    const source = [
      `import { XhHeatmapRoot, XhMenuRoot, XhPopconfirmRoot, XhTableRoot, XhTreeRoot, XhSelectRoot } from '@xihan-ui/react'`,
      `<XhHeatmapRoot onCellPress={go} onCellFocus={go} />`,
      `<XhMenuRoot onSelect={run} />`,
      `<XhPopconfirmRoot onCancel={undo} />`,
      `<XhTreeRoot multiple />`,
      `<XhTreeRoot multiple={false} />`,
      `<XhTreeRoot multiple={multi} />`,
      `<XhTableRoot footer data={rows} />`,
      `<XhSelectRoot multiple onSelect={keep} />`,
    ].join('\n')
    const result = migrateSource(source, 'jsx', V5)
    expect(result.text.split('\n').slice(1)).toEqual([
      `<XhHeatmapRoot onDatumPress={go} onCellFocus={go} />`,
      `<XhMenuRoot onItemSelect={run} />`,
      `<XhPopconfirmRoot onCancelPress={undo} />`,
      `<XhTreeRoot selectionMode="multiple" />`,
      `<XhTreeRoot />`,
      `<XhTreeRoot multiple={multi} />`,
      `<XhTableRoot footerRows={1} data={rows} />`,
      // 选择器的 multiple 与原生 onSelect 不归这几条规则管
      `<XhSelectRoot multiple onSelect={keep} />`,
    ])
    expect(result.findings).toEqual([
      { line: 2, message: 'heatmap 的 onCellFocus 在 5.0 删除了，按更新日志改写' },
      { line: 7, message: 'multiple 写了表达式：改成 selectionMode，开着时取 "multiple"，关着时不写' },
    ])
  })

  it('vue 模板：短横线写法与 @ 事件一起改', () => {
    const source = [
      `<script setup lang="ts">`,
      `import { XhTreeRoot } from '@xihan-ui/vue'`,
      `</script>`,
      `<template>`,
      `  <XhTreeRoot multiple />`,
      `  <xh-tree-root :multiple="false" />`,
      `  <XhMenuRoot @select="run" />`,
      `  <XhHeatmapRoot @cell-press.stop="go" />`,
      `  <XhTableRoot footer />`,
      `</template>`,
    ].join('\n')
    expect(migrateSource(source, 'vue', V5).text.split('\n').slice(4, 9)).toEqual([
      `  <XhTreeRoot selection-mode="multiple" />`,
      `  <xh-tree-root />`,
      `  <XhMenuRoot @item-select="run" />`,
      `  <XhHeatmapRoot @datum-press.stop="go" />`,
      `  <XhTableRoot :footer-rows="1" />`,
    ])
  })

  it('web Components：只在元素上改的 attribute、独特事件的监听直接改，与原生同名的事件报出来', () => {
    const source = [
      `<xh-dialog role="alertdialog"><div data-xh-part="content"></div></xh-dialog>`,
      `<xh-notification-item title="已保存"></xh-notification-item>`,
      `<xh-table footer></xh-table>`,
      `<xh-menu></xh-menu>`,
      `<script type="module">`,
      `  heatmap.addEventListener('cell-press', go)`,
      `  menu.addEventListener('select', run)`,
      `</script>`,
    ].join('\n')
    const result = migrateSource(source, 'html', V5)
    expect(result.text.split('\n').slice(0, 6)).toEqual([
      `<xh-dialog dialog-role="alertdialog"><div data-xh-part="content"></div></xh-dialog>`,
      `<xh-notification-item title-text="已保存"></xh-notification-item>`,
      `<xh-table footer-rows="1"></xh-table>`,
      `<xh-menu></xh-menu>`,
      `<script type="module">`,
      `  heatmap.addEventListener('datum-press', go)`,
    ])
    expect(result.findings.map(f => f.line)).toEqual([7])
  })

  it('vue 里的 xh- 短横线标签是框架组件：只改 Web Components 的那几条不碰它', () => {
    const source = `<template><xh-notification-item title="已保存" /></template>`
    expect(migrateSource(source, 'vue', V5).text).toBe(source)
  })

  it('删掉的覆盖槽报出位置；没提到本库的文件原样跳过', () => {
    const css = `.x { --xh-command-list-busy-opacity: 0.5; }`
    expect(migrateSource(css, 'css', V5).findings).toEqual([{ line: 1, message: '--xh-command-list-busy-opacity 在 5.0 删除了，按更新日志改写' }])
    const plain = `export const select = (onSelect: () => void) => onSelect()`
    expect(migrateSource(plain, 'script', V5)).toEqual({ text: plain, edits: 0, findings: [] })
  })

  it('已经是 5.0 写法的代码迁一遍原样不动', () => {
    const source = [
      `import { colorParse } from '@xihan-ui/core/color'`,
      `import { XhHeatmapRoot, XhMenuRoot, XhTreeRoot } from '@xihan-ui/react'`,
      `<XhHeatmapRoot onDatumPress={go} />`,
      `<XhMenuRoot onItemSelect={run} />`,
      `<XhTreeRoot selectionMode="multiple" />`,
    ].join('\n')
    expect(migrateSource(source, 'jsx', V5)).toEqual({ text: source, edits: 0, findings: [] })
  })
})

describe('migrate：跨多个 major', () => {
  it('2.x → 5.0 依次套用 3、4、5 的规则：轻提示并入通知、分段控件并入单选组，关键帧与令牌改名', () => {
    const source = [
      `import { XhSegmentedIndicator, XhSegmentedRoot, XhToastRoot, XhToastTitle } from '@xihan-ui/vue'`,
      `<XhToastRoot><XhToastTitle /></XhToastRoot>`,
      `<XhSegmentedRoot><XhSegmentedIndicator /></XhSegmentedRoot>`,
      `<xh-toast><p data-xh-part="title"></p></xh-toast>`,
      `.x { animation-name: xh-spinner-rotate; animation-duration: var(--xh-spin-duration); }`,
    ].join('\n')
    expect(migrateSource(source, 'vue', migrationsBetween(2, 5)).text).toBe([
      `import { XhRadioGroupThumb, XhRadioGroupRoot, XhNotificationItem, XhNotificationItemTitle } from '@xihan-ui/vue'`,
      `<XhNotificationItem preset="toast"><XhNotificationItemTitle /></XhNotificationItem>`,
      `<XhRadioGroupRoot variant="segmented"><XhRadioGroupThumb /></XhRadioGroupRoot>`,
      `<xh-notification-item preset="toast"><p data-xh-part="item-title"></p></xh-notification-item>`,
      `.x { animation-name: xh-spin; animation-duration: var(--xh-motion-loop-spin); }`,
    ].join('\n'))
  })

  it('1.x → 2.0：底层包并入 core，组件整体改名连同部件、覆盖槽与元素', () => {
    const source = [
      `import { startSkinCheck } from '@xihan-ui/kernel/skin-check'`,
      `import { XhEllipsis, XhAlertIcon } from '@xihan-ui/vue'`,
      `<XhEllipsis /><XhAlertIcon />`,
      `<xh-qr-code></xh-qr-code>`,
      `.x { --xh-dynamic-input-add-bg: red; }`,
      `[data-scope='slider'][data-part='mark'] { color: red }`,
    ].join('\n')
    expect(migrateSource(source, 'vue', migrationsBetween(1, 2)).text).toBe([
      `import { startSkinCheck } from '@xihan-ui/core/skin-check'`,
      `import { XhTruncate, XhAlertIndicator } from '@xihan-ui/vue'`,
      `<XhTruncate /><XhAlertIndicator />`,
      `<xh-matrix-code></xh-matrix-code>`,
      `.x { --xh-field-array-add-bg: red; }`,
      `[data-scope='slider'][data-part='tick'] { color: red }`,
    ].join('\n'))
  })
})

describe('xihan-ui migrate 命令', () => {
  let project: string

  beforeEach(() => {
    project = mkdtempSync(join(tmpdir(), 'xihan-ui-migrate-'))
    mkdirSync(join(project, 'src'))
    mkdirSync(join(project, 'node_modules'))
    writeFileSync(join(project, 'src', 'App.tsx'), `import { XhMenuRoot } from '@xihan-ui/react'\nexport const App = () => <XhMenuRoot onSelect={run} />\n`)
    writeFileSync(join(project, 'node_modules', 'lib.js'), `<XhMenuRoot onSelect={run} />`)
  })

  afterEach(() => {
    rmSync(project, { recursive: true, force: true })
  })

  async function run(...argv: string[]): Promise<{ code: number, stdout: string, stderr: string }> {
    const out: string[] = []
    const err: string[] = []
    const code = await runCli(argv, { stdout: t => out.push(t), stderr: t => err.push(t), cwd: project })
    return { code, stdout: out.join('\n'), stderr: err.join('\n') }
  }

  it('--check 只算不写，有要改的就以 1 退出；不带它就写回，node_modules 不碰', async () => {
    const check = await run('migrate', '4.2.0', '5', '--check')
    expect(check.code).toBe(1)
    expect(check.stdout).toContain('改写 1 个文件，共 1 处（未写回）')
    expect(readFileSync(join(project, 'src', 'App.tsx'), 'utf8')).toContain('onSelect')

    const write = await run('migrate', 'v4', '5')
    expect(write.code).toBe(0)
    expect(write.stdout).toContain('- src/App.tsx：1 处')
    expect(write.stdout).toContain('## 5.0 升级须知里改不了代码的')
    expect(readFileSync(join(project, 'src', 'App.tsx'), 'utf8')).toContain('onItemSelect={run}')
    expect(readFileSync(join(project, 'node_modules', 'lib.js'), 'utf8')).toContain('onSelect')

    expect((await run('migrate', '4', '5', '--check')).code).toBe(0)
  })

  it('--format json 给出结构化结果；版本写反、超出规则范围时报用法错误', async () => {
    const json = JSON.parse((await run('migrate', '4', '5', '--dry-run', '--format', 'json')).stdout)
    expect(json).toMatchObject({ from: 4, to: 5, majors: [5], written: false, files: [{ file: 'src/App.tsx', edits: 1 }] })
    expect(await run('migrate', '5', '4')).toMatchObject({ code: 2, stderr: '到版本（4）要比从版本（5）新' })
    expect((await run('migrate', '5', '6')).stderr).toContain('最新的一套迁移规则是 5.0')
  })
})

describe('验收：对文档示例跑一遍 codemod 后照样通过类型检查', () => {
  it('文档站全部示例（三种写法）迁一遍 4 → 5 一处不改、一条不报：迁移前后的类型检查结果相同', () => {
    let files = 0
    const touched: string[] = []
    for (const dir of readdirSync(DEMOS)) {
      for (const name of readdirSync(join(DEMOS, dir))) {
        const dialect = dialectOf(name)
        if (!dialect)
          continue
        files++
        const result = migrateSource(readFileSync(join(DEMOS, dir, name), 'utf8'), dialect, V5)
        if (result.edits > 0 || result.findings.length > 0)
          touched.push(`${dir}/${name}`)
      }
    }
    expect(files).toBeGreaterThan(1000)
    expect(touched).toEqual([])
  })

  it('按 4.x 写的 React 代码迁移后对着 5.x 的适配器源码通过 tsc，迁移前通不过', () => {
    const v4 = [
      `import type { HeatmapCellDetails, MenuSelectDetails } from '@xihan-ui/headless'`,
      `import type { ReactNode } from 'react'`,
      `import { colorParse, colorToString, formatHotkey } from '@xihan-ui/headless'`,
      `import { XhHeatmapRoot, XhMenuRoot, XhPopconfirmRoot, XhTreeRoot } from '@xihan-ui/react'`,
      `import { parseColorToOklch } from '@xihan-ui/tokens'`,
      ``,
      `export function App(): ReactNode {`,
      `  const brand = parseColorToOklch('#3366ff')`,
      `  const white = colorParse('#fff')`,
      `  const onDatum = (details: HeatmapCellDetails): void => void details`,
      `  const onPick = (details: MenuSelectDetails): void => void [details, brand, white && colorToString(white, 'hex', false), formatHotkey(['mod', 'k'])]`,
      `  return (`,
      `    <>`,
      `      <XhHeatmapRoot onCellPress={onDatum} />`,
      `      <XhMenuRoot onSelect={onPick} />`,
      `      <XhPopconfirmRoot onCancel={() => {}} />`,
      `      <XhTreeRoot multiple />`,
      `    </>`,
      `  )`,
      `}`,
      ``,
    ].join('\n')
    const migrated = migrateSource(v4, 'jsx', V5)
    expect(migrated.findings).toEqual([])

    const dir = mkdtempSync(join(tmpdir(), 'xihan-ui-migrate-tsc-'))
    try {
      writeFileSync(join(dir, 'v4.tsx'), v4)
      writeFileSync(join(dir, 'v5.tsx'), migrated.text)
      // 沿用示例类型检查的路径映射（钉到各包源码），补上 core 的两个子入口；paths 不随 extends 合并，整张抄过来
      const demos = JSON.parse(readFileSync(join(REACT, 'tsconfig.demos.json'), 'utf8').replace(/^\s*\/\/.*$/gm, '')) as { compilerOptions: { paths: Record<string, string[]> } }
      const paths = Object.fromEntries(Object.entries(demos.compilerOptions.paths).map(([key, targets]) => [key, targets.map(target => resolve(REACT, target))]))
      paths['@xihan-ui/core/color'] = [join(UI, 'packages/engine/core/src/color/index.ts')]
      paths['@xihan-ui/core/hotkey'] = [join(UI, 'packages/engine/core/src/hotkey/index.ts')]
      writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({
        extends: join(REACT, 'tsconfig.json'),
        compilerOptions: { paths, types: [], noEmit: true },
        include: ['v4.tsx', 'v5.tsx'],
      }))
      const tsc = createRequire(join(REACT, 'package.json')).resolve('typescript/bin/tsc')
      let output = ''
      try {
        execFileSync(process.execPath, [tsc, '-p', join(dir, 'tsconfig.json')], { encoding: 'utf8' })
      }
      catch (error) {
        output = String((error as { stdout?: string }).stdout ?? '')
      }
      const errorsIn = (file: string): string[] => output.split('\n').filter(line => line.includes(`${file}(`))
      expect(errorsIn('v5.tsx')).toEqual([])
      expect(errorsIn('v4.tsx').length).toBeGreaterThan(5)
    }
    finally {
      rmSync(dir, { recursive: true, force: true })
    }
  }, 240_000)
})
