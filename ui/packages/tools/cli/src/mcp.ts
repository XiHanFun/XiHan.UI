/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// stdio 传输的 MCP 服务端：逐行读 JSON-RPC 请求，逐行写响应，日志只写 stderr。

import type { Readable, Writable } from 'node:stream'
import type { ToolContext } from './tools'
import process from 'node:process'
import { createInterface } from 'node:readline'
import { QueryError } from './query'
import { ArgumentError, PROMPTS, TOOLS } from './tools'

/** 按新到旧排列的受支持协议版本。 */
export const PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'] as const

const PARSE_ERROR = -32700
const INVALID_REQUEST = -32600
const METHOD_NOT_FOUND = -32601
const INVALID_PARAMS = -32602

type Id = string | number

interface Request {
  readonly jsonrpc: '2.0'
  readonly id?: Id | null
  readonly method: string
  readonly params?: unknown
}

type Response
  = | { jsonrpc: '2.0', id: Id | null, result: unknown }
    | { jsonrpc: '2.0', id: Id | null, error: { code: number, message: string } }

class RpcError extends Error {
  readonly code: number

  constructor(code: number, message: string) {
    super(message)
    this.code = code
  }
}

export interface McpServerOptions {
  readonly context: ToolContext
  readonly version: string
  /** 写进 initialize 结果的使用说明。 */
  readonly instructions: string
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

/** 处理一条请求；通知（不带 id）返回 undefined。 */
export function handleMessage(message: unknown, options: McpServerOptions): Response | undefined {
  const record = asRecord(message)
  const id = record.id
  const validId = typeof id === 'string' || typeof id === 'number'
  if (record.jsonrpc !== '2.0' || typeof record.method !== 'string') {
    return { jsonrpc: '2.0', id: validId ? id : null, error: { code: INVALID_REQUEST, message: '不是合法的 JSON-RPC 2.0 请求' } }
  }
  const request = record as unknown as Request
  const isNotification = !('id' in record)
  try {
    const result = dispatch(request, options)
    if (isNotification)
      return undefined
    return { jsonrpc: '2.0', id: validId ? id : null, result: result ?? {} }
  }
  catch (error) {
    if (isNotification)
      return undefined
    const code = error instanceof RpcError ? error.code : -32603
    return { jsonrpc: '2.0', id: validId ? id : null, error: { code, message: (error as Error).message } }
  }
}

function dispatch(request: Request, options: McpServerOptions): unknown {
  const params = asRecord(request.params)
  switch (request.method) {
    case 'initialize': {
      const requested = params.protocolVersion
      const protocolVersion = PROTOCOL_VERSIONS.find(v => v === requested) ?? PROTOCOL_VERSIONS[0]
      return {
        protocolVersion,
        capabilities: { tools: { listChanged: false }, prompts: { listChanged: false } },
        serverInfo: { name: 'xihan-ui', title: 'XiHan.UI', version: options.version },
        instructions: options.instructions,
      }
    }
    case 'notifications/initialized':
    case 'notifications/cancelled':
      return undefined
    case 'ping':
      return {}
    case 'tools/list':
      return {
        tools: TOOLS.map(tool => ({
          name: tool.name,
          title: tool.title,
          description: tool.description,
          inputSchema: tool.inputSchema,
          annotations: { readOnlyHint: true, openWorldHint: false },
        })),
      }
    case 'tools/call':
      return callTool(params, options.context)
    case 'prompts/list':
      return {
        prompts: PROMPTS.map(prompt => ({
          name: prompt.name,
          title: prompt.title,
          description: prompt.description,
          arguments: prompt.arguments,
        })),
      }
    case 'prompts/get':
      return getPrompt(params, options.context)
    default:
      throw new RpcError(METHOD_NOT_FOUND, `不支持的方法：${request.method}`)
  }
}

function callTool(params: Record<string, unknown>, context: ToolContext): unknown {
  const tool = TOOLS.find(t => t.name === params.name)
  if (!tool)
    throw new RpcError(INVALID_PARAMS, `没有名为 ${String(params.name)} 的工具`)
  try {
    return { content: [{ type: 'text', text: tool.run(asRecord(params.arguments), context) }] }
  }
  catch (error) {
    if (error instanceof QueryError || error instanceof ArgumentError) {
      const near = error instanceof QueryError && error.suggestions.length ? `\n\n候选：\n${error.suggestions.map(s => `- ${s}`).join('\n')}` : ''
      return { content: [{ type: 'text', text: `${error.message}${near}` }], isError: true }
    }
    throw error
  }
}

function getPrompt(params: Record<string, unknown>, context: ToolContext): unknown {
  const prompt = PROMPTS.find(p => p.name === params.name)
  if (!prompt)
    throw new RpcError(INVALID_PARAMS, `没有名为 ${String(params.name)} 的提示词`)
  const raw = asRecord(params.arguments)
  const args: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string')
      args[key] = value
  }
  const missing = prompt.arguments.filter(a => a.required && !args[a.name])
  if (missing.length)
    throw new RpcError(INVALID_PARAMS, `缺少参数：${missing.map(a => a.name).join('、')}`)
  return {
    description: prompt.description,
    messages: [{ role: 'user', content: { type: 'text', text: prompt.render(args, context) } }],
  }
}

/** 处理一行输入：单条请求或批量数组，返回要写出的那一行（没有响应时为 undefined）。 */
export function handleLine(line: string, options: McpServerOptions): string | undefined {
  let message: unknown
  try {
    message = JSON.parse(line)
  }
  catch {
    return JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: PARSE_ERROR, message: '无法解析的 JSON' } })
  }
  if (Array.isArray(message)) {
    const responses = message.map(m => handleMessage(m, options)).filter(r => r !== undefined)
    return responses.length ? JSON.stringify(responses) : undefined
  }
  const response = handleMessage(message, options)
  return response ? JSON.stringify(response) : undefined
}

/** 在给定的输入输出流上运行服务端，输入结束时返回。 */
export function serveStdio(options: McpServerOptions, input: Readable = process.stdin, output: Writable = process.stdout): Promise<void> {
  const reader = createInterface({ input, crlfDelay: Infinity })
  reader.on('line', (line) => {
    if (!line.trim())
      return
    const reply = handleLine(line, options)
    if (reply !== undefined)
      output.write(`${reply}\n`)
  })
  return new Promise(resolve => reader.once('close', () => resolve()))
}
