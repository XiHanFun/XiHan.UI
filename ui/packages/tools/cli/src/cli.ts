/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 命令行入口：解析参数、分派命令、按 markdown 或 json 输出。

import type { Framework, Knowledge } from './knowledge'
import type { Client, SetupMode } from './setup'
import process from 'node:process'
import { parseArgs } from 'node:util'
import { FRAMEWORKS, loadKnowledge, parseFramework } from './knowledge'
import { serveStdio } from './mcp'
import { detectProject, versionNotice } from './project'
import { componentParts, demoSource, listComponents, listPages, queryChangelog, QueryError, queryTokens, requireComponent, resolveDoc } from './query'
import { renderChangelog, renderDemo, renderDemoList, renderDoc, renderInfo, renderList, renderPages, renderParts, renderTokens } from './render'
import { applyAction, checkAction, CLIENTS, describeAction, planSetup, SETUP_MODES } from './setup'
import { ArgumentError } from './tools'

const HELP = `xihan-ui —— XiHan.UI 的离线知识库与 MCP 服务端

用法：xihan-ui <命令> [参数] [选项]

查询
  list [--category <分类>] [--query <关键字>]   按分类列出组件
  info <组件>                                    组件 API：产物、部件、Props、事件、插槽、状态、键盘
  doc [<组件|页面>]                              完整文档，示例按写法内联；不带参数列出指南页
  demo <组件> [<示例>]                           列出示例或输出示例源码
  token [<关键字>] [--component <组件>]          设计令牌与组件覆盖槽
  parts <组件>                                   部件选择器、数据属性与覆盖槽
  design.md                                      设计语言文档
  changelog [<版本> [<版本>]] [--keyword <词>]   更新日志，两个版本时取区间

集成
  mcp                                            以 stdio 启动 MCP 服务端
  setup --client <${CLIENTS.join('|')}>   写入 MCP 配置与技能
        [--mode <${SETUP_MODES.join('|')}>] [--pin <版本>] [--dry-run] [--check]

选项
  --framework <vue|react|web-components>   示例写法，缺省取项目里装的适配器
  --format <markdown|json>                 输出格式，缺省 markdown
  -v, --version                            打印版本
  -h, --help                               打印本帮助

组件名可写标识（date-picker）、PascalCase（DatePicker）、导出名（XhDatePickerRoot）、标签（xh-date-picker）或中文名。`

class UsageError extends Error {}

/** 命令行的输入输出环境，缺省为当前进程。 */
export interface CliEnvironment {
  readonly stdout: (text: string) => void
  readonly stderr: (text: string) => void
  /** 离线数据目录，缺省为包内 data/。 */
  readonly dataDir?: string
  /** 识别项目所用的目录，缺省为 process.cwd()。 */
  readonly cwd?: string
}

const defaultEnvironment: CliEnvironment = {
  stdout: text => process.stdout.write(`${text}\n`),
  stderr: text => process.stderr.write(`${text}\n`),
}

function requireArg(value: string | undefined, usage: string): string {
  if (!value)
    throw new UsageError(`缺少参数。用法：xihan-ui ${usage}`)
  return value
}

function pickFramework(value: string | undefined, fallback: Framework): Framework {
  if (value === undefined)
    return fallback
  const framework = parseFramework(value)
  if (!framework)
    throw new UsageError(`--framework 只能是 ${FRAMEWORKS.join(' / ')}，收到 ${value}`)
  return framework
}

interface Result {
  readonly markdown: string
  readonly json: unknown
}

function query(command: string, positionals: readonly string[], values: Record<string, string | boolean | undefined>, knowledge: Knowledge, framework: Framework): Result {
  const str = (key: string): string | undefined => (typeof values[key] === 'string' ? values[key] as string : undefined)
  switch (command) {
    case 'list': {
      const groups = listComponents(knowledge, { category: str('category'), query: str('query') })
      return { markdown: renderList(knowledge, groups), json: groups }
    }
    case 'info': {
      const entry = requireComponent(knowledge, requireArg(positionals[0], 'info <组件>'))
      return { markdown: renderInfo(knowledge, entry), json: entry }
    }
    case 'doc': {
      if (!positionals[0]) {
        const pages = listPages(knowledge).map(({ markdown: _, ...page }) => page)
        return { markdown: renderPages(knowledge, listPages(knowledge)), json: pages }
      }
      const doc = resolveDoc(knowledge, positionals[0], framework)
      return { markdown: renderDoc(doc), json: doc }
    }
    case 'demo': {
      const entry = requireComponent(knowledge, requireArg(positionals[0], 'demo <组件> [<示例>]'))
      if (!positionals[1])
        return { markdown: renderDemoList(entry), json: entry.demos }
      const demo = demoSource(knowledge, entry, positionals[1], framework)
      return { markdown: renderDemo(demo), json: { component: entry.id, framework: demo.framework, ...demo.demo, source: demo.source } }
    }
    case 'token': {
      const result = queryTokens(knowledge, { query: positionals[0], component: str('component') })
      return { markdown: renderTokens(result), json: result.kind === 'component' ? { kind: result.kind, component: result.component.id, tokens: result.tokens } : result }
    }
    case 'parts': {
      const { component } = componentParts(knowledge, requireArg(positionals[0], 'parts <组件>'))
      const { id, parts, requiredParts, dataAttributes, aria, componentTokens } = component
      return { markdown: renderParts(component), json: { id, parts, requiredParts, dataAttributes, aria, componentTokens } }
    }
    case 'design.md':
    case 'design-md': {
      const markdown = knowledge.designMd()
      return { markdown, json: { markdown } }
    }
    case 'changelog': {
      const sections = queryChangelog(knowledge, { from: positionals[0], to: positionals[1], keyword: str('keyword') })
      return { markdown: renderChangelog(sections), json: sections }
    }
    default:
      throw new UsageError(`未知命令：${command}。xihan-ui --help 查看全部命令`)
  }
}

function runSetup(values: Record<string, string | boolean | undefined>, knowledge: Knowledge, out: CliEnvironment): number {
  const client = values.client
  if (typeof client !== 'string' || !CLIENTS.includes(client as Client))
    throw new UsageError(`--client 只能是 ${CLIENTS.join(' / ')}`)
  const mode = (typeof values.mode === 'string' ? values.mode : 'both') as SetupMode
  if (!SETUP_MODES.includes(mode))
    throw new UsageError(`--mode 只能是 ${SETUP_MODES.join(' / ')}`)
  const project = detectProject(out.cwd)
  if (!project.root)
    throw new UsageError('当前目录不在 git 仓库里，向上也找不到 package.json，在项目根目录里运行 setup')
  const version = typeof values.pin === 'string' ? values.pin : project.installedVersion ?? knowledge.meta.version
  const actions = planSetup({ client: client as Client, mode, root: project.root, version, platform: process.platform })

  if (values.check) {
    const problems = actions.map(checkAction).filter((p): p is string => p !== undefined)
    if (problems.length) {
      for (const problem of problems)
        out.stderr(`✗ ${problem}`)
      return 1
    }
    out.stdout(`✓ ${client} 的 XiHan.UI 配置已就绪（@xihan-ui/cli@${version}）`)
    return 0
  }
  for (const action of actions) {
    if (!values['dry-run'])
      applyAction(action)
    out.stdout(`${values['dry-run'] || action.kind === 'print' ? '' : '✓ '}${describeAction(action)}`)
  }
  return 0
}

/** 运行一次命令行，返回退出码；mcp 命令在输入流结束后返回。 */
export async function runCli(argv: readonly string[], environment: Partial<CliEnvironment> = {}): Promise<number> {
  const out: CliEnvironment = { ...defaultEnvironment, ...environment }
  let parsed
  try {
    parsed = parseArgs({
      args: [...argv],
      allowPositionals: true,
      strict: true,
      options: {
        'category': { type: 'string' },
        'query': { type: 'string' },
        'component': { type: 'string' },
        'keyword': { type: 'string' },
        'framework': { type: 'string' },
        'format': { type: 'string' },
        'client': { type: 'string' },
        'mode': { type: 'string' },
        'pin': { type: 'string' },
        'dry-run': { type: 'boolean' },
        'check': { type: 'boolean' },
        'version': { type: 'boolean', short: 'v' },
        'help': { type: 'boolean', short: 'h' },
      },
    })
  }
  catch (error) {
    out.stderr(`${(error as Error).message}\n\n${HELP}`)
    return 2
  }
  const { values, positionals } = parsed
  const [command, ...rest] = positionals

  if (values.help || (!command && !values.version)) {
    out.stdout(HELP)
    return 0
  }

  try {
    const knowledge = loadKnowledge(out.dataDir)
    if (values.version) {
      out.stdout(knowledge.meta.version)
      return 0
    }
    const project = detectProject(out.cwd)
    const framework = pickFramework(values.framework, project.framework ?? 'vue')
    const notice = versionNotice(project, knowledge.meta.version)

    if (command === 'mcp') {
      const instructions = [
        `XiHan.UI ${knowledge.meta.version} 的离线知识库。写 XiHan.UI 代码前先用 xihan_ui_info 核对组件 API，用 xihan_ui_doc / xihan_ui_demo 取文档与示例，样式只用 xihan_ui_parts 与 xihan_ui_token 查得到的部件选择器与令牌。`,
        `缺省示例写法：${framework}。`,
        ...(notice ? [notice] : []),
      ].join('\n')
      if (notice)
        out.stderr(notice)
      await serveStdio({ context: { knowledge, framework }, version: knowledge.meta.version, instructions })
      return 0
    }
    if (command === 'setup')
      return runSetup(values, knowledge, out)

    const format = values.format ?? 'markdown'
    if (format !== 'markdown' && format !== 'json')
      throw new UsageError(`--format 只能是 markdown / json，收到 ${format}`)
    const result = query(command!, rest, values, knowledge, framework)
    if (notice)
      out.stderr(notice)
    out.stdout(format === 'json' ? JSON.stringify(result.json, null, 2) : result.markdown)
    return 0
  }
  catch (error) {
    if (error instanceof QueryError) {
      out.stderr(error.message)
      if (error.suggestions.length)
        out.stderr(`候选：\n${error.suggestions.map(s => `  ${s}`).join('\n')}`)
      return 1
    }
    if (error instanceof UsageError || error instanceof ArgumentError) {
      out.stderr(error.message)
      return 2
    }
    out.stderr((error as Error).message)
    return 1
  }
}
