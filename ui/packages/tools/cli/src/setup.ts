/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 把 MCP 服务端配置与 XiHan.UI 技能写进项目，供各 AI 编程工具读取。

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export type Client = 'claude' | 'cursor' | 'vscode' | 'codex'
export type SetupMode = 'mcp' | 'skill' | 'both'

export const CLIENTS: readonly Client[] = ['claude', 'cursor', 'vscode', 'codex']
export const SETUP_MODES: readonly SetupMode[] = ['mcp', 'skill', 'both']

/** MCP 配置里的服务名。 */
export const SERVER_NAME = 'xihan-ui'

export interface SetupOptions {
  readonly client: Client
  readonly mode: SetupMode
  /** 项目根目录，配置文件写在它下面。 */
  readonly root: string
  /** 配置里钉住的 @xihan-ui/cli 版本。 */
  readonly version: string
  readonly platform: NodeJS.Platform
}

export type SetupAction
  = | { readonly kind: 'json', readonly path: string, readonly key: 'mcpServers' | 'servers', readonly entry: Readonly<Record<string, unknown>> }
    | { readonly kind: 'file', readonly path: string, readonly content: string }
    | { readonly kind: 'print', readonly target: string, readonly content: string }

/** 启动服务端的命令；Windows 上 Claude Code 需要经 cmd /c 调 npx。 */
export function serverCommand(client: Client, version: string, platform: NodeJS.Platform): { command: string, args: string[] } {
  const args = ['-y', `@xihan-ui/cli@${version}`, 'mcp']
  if (client === 'claude' && platform === 'win32')
    return { command: 'cmd', args: ['/c', 'npx', ...args] }
  return { command: 'npx', args }
}

function skillSource(): string {
  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'xihan-ui', 'SKILL.md'), 'utf8')
}

/** 按客户端与模式算出要做的事，不碰磁盘。 */
export function planSetup(options: SetupOptions): SetupAction[] {
  const actions: SetupAction[] = []
  const { command, args } = serverCommand(options.client, options.version, options.platform)
  if (options.mode !== 'skill') {
    switch (options.client) {
      case 'claude':
        actions.push({ kind: 'json', path: join(options.root, '.mcp.json'), key: 'mcpServers', entry: { command, args } })
        break
      case 'cursor':
        actions.push({ kind: 'json', path: join(options.root, '.cursor', 'mcp.json'), key: 'mcpServers', entry: { command, args } })
        break
      case 'vscode':
        actions.push({ kind: 'json', path: join(options.root, '.vscode', 'mcp.json'), key: 'servers', entry: { type: 'stdio', command, args } })
        break
      case 'codex':
        actions.push({
          kind: 'print',
          target: '~/.codex/config.toml',
          content: [`[mcp_servers.${SERVER_NAME}]`, `command = "${command}"`, `args = [${args.map(a => `"${a}"`).join(', ')}]`].join('\n'),
        })
        break
    }
  }
  if (options.mode !== 'mcp') {
    const dir = options.client === 'claude' ? join('.claude', 'skills') : join('.agents', 'skills')
    actions.push({ kind: 'file', path: join(options.root, dir, SERVER_NAME, 'SKILL.md'), content: skillSource() })
  }
  return actions
}

function readConfig(path: string): Record<string, unknown> {
  if (!existsSync(path))
    return {}
  const text = readFileSync(path, 'utf8')
  if (!text.trim())
    return {}
  try {
    const value = JSON.parse(text) as unknown
    if (value === null || typeof value !== 'object' || Array.isArray(value))
      throw new Error('顶层不是对象')
    return value as Record<string, unknown>
  }
  catch (error) {
    throw new Error(`无法解析 ${path}（${(error as Error).message}），文件未改动；请按 --dry-run 打印的片段手动合并`)
  }
}

/** 一条动作的说明，--dry-run 与执行后都打印它。 */
export function describeAction(action: SetupAction): string {
  if (action.kind === 'json')
    return `在 ${action.path} 的 ${action.key} 里写入 ${SERVER_NAME}：\n${JSON.stringify({ [action.key]: { [SERVER_NAME]: action.entry } }, null, 2)}`
  if (action.kind === 'file')
    return `写入 ${action.path}`
  return `把下面这段加进 ${action.target}：\n${action.content}`
}

/** 执行动作：JSON 配置只改 xihan-ui 一项，其余内容原样保留。 */
export function applyAction(action: SetupAction): void {
  if (action.kind === 'print')
    return
  mkdirSync(dirname(action.path), { recursive: true })
  if (action.kind === 'file') {
    writeFileSync(action.path, action.content)
    return
  }
  const config = readConfig(action.path)
  const servers = (config[action.key] !== null && typeof config[action.key] === 'object' ? config[action.key] : {}) as Record<string, unknown>
  config[action.key] = { ...servers, [SERVER_NAME]: action.entry }
  writeFileSync(action.path, `${JSON.stringify(config, null, 2)}\n`)
}

/** 核对动作是否已经生效；返回未生效的说明。 */
export function checkAction(action: SetupAction): string | undefined {
  if (action.kind === 'print')
    return undefined
  if (!existsSync(action.path))
    return `缺少 ${action.path}`
  if (action.kind === 'file')
    return readFileSync(action.path, 'utf8') === action.content ? undefined : `${action.path} 与当前版本的技能不一致`
  const config = readConfig(action.path)
  const servers = config[action.key] as Record<string, unknown> | undefined
  const current = servers?.[SERVER_NAME]
  if (!current)
    return `${action.path} 里没有 ${SERVER_NAME}`
  return JSON.stringify(current) === JSON.stringify(action.entry) ? undefined : `${action.path} 里的 ${SERVER_NAME} 与期望不一致`
}
