/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// MCP 工具与提示词的定义：参数结构、说明与处理函数。

import type { Framework, Knowledge } from './knowledge'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FRAMEWORKS, parseFramework } from './knowledge'
import { componentParts, demoSource, listComponents, listPages, queryChangelog, queryTokens, requireComponent, resolveDoc } from './query'
import { renderChangelog, renderDemo, renderDemoList, renderDoc, renderInfo, renderList, renderPages, renderParts, renderTokens } from './render'

export interface ToolContext {
  readonly knowledge: Knowledge
  /** 未指定写法时使用的写法：项目里识别到的适配器，识别不到时是 Vue。 */
  readonly framework: Framework
}

type Args = Readonly<Record<string, unknown>>

export interface JsonSchema {
  readonly type: 'object'
  readonly properties: Readonly<Record<string, Readonly<Record<string, unknown>>>>
  readonly required?: readonly string[]
  readonly additionalProperties: false
}

export interface ToolDefinition {
  readonly name: string
  readonly title: string
  readonly description: string
  readonly inputSchema: JsonSchema
  readonly run: (args: Args, context: ToolContext) => string
}

/** 参数校验失败。 */
export class ArgumentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ArgumentError'
  }
}

function optionalString(args: Args, key: string): string | undefined {
  const value = args[key]
  if (value === undefined || value === null || value === '')
    return undefined
  if (typeof value !== 'string')
    throw new ArgumentError(`参数 ${key} 必须是字符串`)
  return value
}

function requiredString(args: Args, key: string): string {
  const value = optionalString(args, key)
  if (value === undefined)
    throw new ArgumentError(`缺少参数 ${key}`)
  return value
}

function frameworkArg(args: Args, context: ToolContext): Framework {
  const raw = optionalString(args, 'framework')
  if (raw === undefined)
    return context.framework
  const framework = parseFramework(raw)
  if (!framework)
    throw new ArgumentError(`framework 只能是 ${FRAMEWORKS.join(' / ')}，收到 ${raw}`)
  return framework
}

const frameworkProperty = {
  type: 'string',
  enum: [...FRAMEWORKS],
  description: '示例写法：vue、react 或 web-components。缺省取项目里装的适配器，识别不到时为 vue。',
}

const componentProperty = {
  type: 'string',
  description: '组件名：标识（date-picker）、PascalCase（DatePicker）、导出名（XhDatePickerRoot）、标签（xh-date-picker）或中文名均可。',
}

export const TOOLS: readonly ToolDefinition[] = [
  {
    name: 'xihan_ui_list',
    title: '列出组件',
    description: '按分类列出 XiHan.UI 的全部组件：标识、中文名、Vue / React 根组件名、自定义元素标签与状态。不确定该用哪个组件时先调它。',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: '只列某个分类，写分类标识或中文名，如 form、数据录入。' },
        query: { type: 'string', description: '按名称或概述里的关键字过滤。' },
      },
      additionalProperties: false,
    },
    run: (args, { knowledge }) => renderList(knowledge, listComponents(knowledge, {
      category: optionalString(args, 'category'),
      query: optionalString(args, 'query'),
    })),
  },
  {
    name: 'xihan_ui_info',
    title: '组件 API',
    description: '取一个组件的完整 API：产物（导出名、标签、皮肤）、部件、Props 与条目数据结构、事件、插槽、React 专有属性、状态、connect API 与键盘规格。写组件代码前必须先查，不要凭记忆写属性名。',
    inputSchema: {
      type: 'object',
      properties: { component: componentProperty },
      required: ['component'],
      additionalProperties: false,
    },
    run: (args, { knowledge }) => renderInfo(knowledge, requireComponent(knowledge, requiredString(args, 'component'))),
  },
  {
    name: 'xihan_ui_doc',
    title: '完整文档',
    description: '取组件页或指南页的完整 Markdown，示例按所选写法内联为源码。组件写标识（select），指南写站内路径（guide/theme、installation、adapters/react）；不传 name 时列出全部指南页。',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: '组件名或文档页路径。' },
        framework: frameworkProperty,
      },
      additionalProperties: false,
    },
    run: (args, context) => {
      const name = optionalString(args, 'name')
      if (!name)
        return renderPages(context.knowledge, listPages(context.knowledge))
      return renderDoc(resolveDoc(context.knowledge, name, frameworkArg(args, context)))
    },
  },
  {
    name: 'xihan_ui_demo',
    title: '示例源码',
    description: '取组件的可运行示例。不传 name 时列出该组件的全部示例；传序号、文件基名或标题时返回所选写法的完整源码。',
    inputSchema: {
      type: 'object',
      properties: {
        component: componentProperty,
        name: { type: 'string', description: '示例序号（1 起）、文件基名（01-basic 或 basic）或标题。' },
        framework: frameworkProperty,
      },
      required: ['component'],
      additionalProperties: false,
    },
    run: (args, context) => {
      const entry = requireComponent(context.knowledge, requiredString(args, 'component'))
      const name = optionalString(args, 'name')
      if (!name)
        return renderDemoList(entry)
      return renderDemo(demoSource(context.knowledge, entry, name, frameworkArg(args, context)))
    },
  },
  {
    name: 'xihan_ui_token',
    title: '设计令牌',
    description: '查设计令牌。传 query 按名字片段查全局令牌（如 bg-brand、shape、control-h、motion-duration）及其缺省取值；传 component 列该组件的覆盖槽；都不传时列出令牌族。写样式时只用这里查得到的令牌，不写散值。',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '令牌名或名字片段，可带 --xh- 前缀。' },
        component: componentProperty,
      },
      additionalProperties: false,
    },
    run: (args, { knowledge }) => renderTokens(queryTokens(knowledge, {
      query: optionalString(args, 'query'),
      component: optionalString(args, 'component'),
    })),
  },
  {
    name: 'xihan_ui_parts',
    title: '样式钩子',
    description: '取组件的样式钩子：每个部件的 [data-scope][data-part] 选择器、connect 写入的数据属性与状态取值、ARIA、组件覆盖槽及其缺省令牌。改组件外观前先查它。',
    inputSchema: {
      type: 'object',
      properties: { component: componentProperty },
      required: ['component'],
      additionalProperties: false,
    },
    run: (args, { knowledge }) => renderParts(componentParts(knowledge, requiredString(args, 'component')).component),
  },
  {
    name: 'xihan_ui_design_md',
    title: '设计语言',
    description: '取 XiHan.UI 的 design.md：缺省主题的颜色、排版、间距、圆角与组件样式令牌，以及视觉规则与禁忌。生成整页界面或判断视觉取舍时读它。',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    run: (_, { knowledge }) => knowledge.designMd(),
  },
  {
    name: 'xihan_ui_changelog',
    title: '更新日志',
    description: '查更新日志。只传 from 取这一版；传 from 与 to 取两版之间（不含 from、含 to）的全部变更，用于升级迁移；keyword 只保留提到它的条目（可写组件名）。都不传时取最近一版。',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: '版本号，如 4.0.0。' },
        to: { type: 'string', description: '版本号，如 4.1.0。' },
        keyword: { type: 'string', description: '关键字或组件名。' },
      },
      additionalProperties: false,
    },
    run: (args, { knowledge }) => renderChangelog(queryChangelog(knowledge, {
      from: optionalString(args, 'from'),
      to: optionalString(args, 'to'),
      keyword: optionalString(args, 'keyword'),
    })),
  },
]

export interface PromptArgument {
  readonly name: string
  readonly description: string
  readonly required: boolean
}

export interface PromptDefinition {
  readonly name: string
  readonly title: string
  readonly description: string
  readonly arguments: readonly PromptArgument[]
  readonly render: (args: Readonly<Record<string, string>>, context: ToolContext) => string
}

/** 包内 skills/xihan-ui/SKILL.md 的正文，去掉 frontmatter。 */
export function skillBody(): string {
  const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'xihan-ui', 'SKILL.md')
  return readFileSync(file, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim()
}

export const PROMPTS: readonly PromptDefinition[] = [
  {
    name: 'xihan-ui-expert',
    title: 'XiHan.UI 专家',
    description: '以 XiHan.UI 专家身份工作：先查 API 再写代码，样式只走部件选择器与令牌。',
    arguments: [],
    render: (_, { framework }) => [
      `你是 XiHan.UI 的专家。当前项目的写法是 ${framework}。以下是使用规范，回答与写代码都按它执行；`,
      '涉及具体组件时先调 xihan_ui_info / xihan_ui_doc / xihan_ui_demo 查证，不要凭记忆写组件名、属性或部件。',
      '',
      skillBody(),
    ].join('\n'),
  },
  {
    name: 'xihan-ui-page-generator',
    title: '用 XiHan.UI 搭页面',
    description: '按描述用 XiHan.UI 组件搭一整页界面。',
    arguments: [
      { name: 'description', description: '页面要做什么：用途、区块、数据与交互。', required: true },
      { name: 'framework', description: '写法：vue、react 或 web-components，缺省取项目里的适配器。', required: false },
    ],
    render: (args, context) => {
      const framework = parseFramework(args.framework) ?? context.framework
      return [
        `用 XiHan.UI 的 ${framework} 写法实现下面这个页面：`,
        '',
        args.description ?? '',
        '',
        '步骤：',
        '1. 调 xihan_ui_design_md 了解视觉规则，调 xihan_ui_list 选定要用的组件；',
        '2. 对每个选定的组件调 xihan_ui_info 核对导出名、部件与 Props，需要时调 xihan_ui_demo 参考示例；',
        '3. 页面布局用 Layout / Flex / Grid 等布局组件与间距令牌，颜色、间距、圆角只取 xihan_ui_token 查得到的令牌；',
        '4. 交付完整可运行的代码，并列出用到的组件与需要额外安装的包。',
      ].join('\n')
    },
  },
]
