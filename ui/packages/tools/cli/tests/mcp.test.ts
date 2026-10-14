import type { McpServerOptions } from '../src/mcp'
import { PassThrough } from 'node:stream'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { loadKnowledge } from '../src/knowledge'
import { handleLine, handleMessage, PROTOCOL_VERSIONS, serveStdio } from '../src/mcp'
import { PROMPTS, TOOLS } from '../src/tools'

const knowledge = loadKnowledge(fileURLToPath(new URL('./fixtures/data', import.meta.url)))
const options: McpServerOptions = { context: { knowledge, framework: 'vue' }, version: '4.1.0', instructions: '说明' }

function call(method: string, params?: unknown, id: number | string = 1): Record<string, any> {
  return handleMessage({ jsonrpc: '2.0', id, method, params }, options) as Record<string, any>
}

describe('initialize', () => {
  it('客户端请求受支持的版本时原样采用', () => {
    expect(call('initialize', { protocolVersion: '2024-11-05' }).result.protocolVersion).toBe('2024-11-05')
  })

  it('请求未知版本时回最新受支持版本', () => {
    const result = call('initialize', { protocolVersion: '1999-01-01' }).result
    expect(result.protocolVersion).toBe(PROTOCOL_VERSIONS[0])
    expect(result.serverInfo).toEqual({ name: 'xihan-ui', title: 'XiHan.UI', version: '4.1.0' })
    expect(result.capabilities).toEqual({ tools: { listChanged: false }, prompts: { listChanged: false } })
    expect(result.instructions).toBe('说明')
  })
})

describe('tools', () => {
  it('列出全部工具，名字唯一且都带参数结构', () => {
    const tools = call('tools/list').result.tools as { name: string, inputSchema: { type: string } }[]
    expect(tools.map(t => t.name)).toEqual(TOOLS.map(t => t.name))
    expect(new Set(tools.map(t => t.name)).size).toBe(tools.length)
    for (const tool of tools)
      expect(tool.inputSchema.type).toBe('object')
  })

  it('调用成功返回文本内容', () => {
    const result = call('tools/call', { name: 'xihan_ui_info', arguments: { component: 'button' } }).result
    expect(result.isError).toBeUndefined()
    expect(result.content[0].text).toContain('# Button 按钮')
  })

  it('缺省写法取上下文里的框架', () => {
    const text = call('tools/call', { name: 'xihan_ui_demo', arguments: { component: 'button', name: '1' } }).result.content[0].text
    expect(text).toContain('```vue')
  })

  it('查不到组件时是工具层错误，带候选', () => {
    const result = call('tools/call', { name: 'xihan_ui_info', arguments: { component: 'buton' } }).result
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('Button（button）')
  })

  it('参数类型不对时是工具层错误', () => {
    const result = call('tools/call', { name: 'xihan_ui_doc', arguments: { name: 'button', framework: 'svelte' } }).result
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('framework 只能是')
  })

  it('未知工具是协议层错误', () => {
    expect(call('tools/call', { name: 'nope' }).error.code).toBe(-32602)
  })
})

describe('prompts', () => {
  it('列出全部提示词', () => {
    expect(call('prompts/list').result.prompts.map((p: { name: string }) => p.name)).toEqual(PROMPTS.map(p => p.name))
  })

  it('专家提示词带上技能正文', () => {
    const text = call('prompts/get', { name: 'xihan-ui-expert' }).result.messages[0].content.text as string
    expect(text).toContain('# 在项目里使用 XiHan.UI')
    expect(text).not.toMatch(/^---/m)
  })

  it('缺必填参数时报错', () => {
    expect(call('prompts/get', { name: 'xihan-ui-page-generator', arguments: {} }).error.code).toBe(-32602)
  })
})

describe('jSON-RPC', () => {
  it('通知不回响应', () => {
    expect(handleMessage({ jsonrpc: '2.0', method: 'notifications/initialized' }, options)).toBeUndefined()
    expect(handleMessage({ jsonrpc: '2.0', method: 'notifications/unknown' }, options)).toBeUndefined()
  })

  it('未知方法与非法请求', () => {
    expect(call('nope').error.code).toBe(-32601)
    expect((handleMessage({ id: 3, method: 'ping' }, options) as Record<string, any>).error.code).toBe(-32600)
  })

  it('解析失败回 -32700，批量请求逐条回复且跳过通知', () => {
    expect(JSON.parse(handleLine('{', options)!).error.code).toBe(-32700)
    const replies = JSON.parse(handleLine(JSON.stringify([
      { jsonrpc: '2.0', id: 'a', method: 'ping' },
      { jsonrpc: '2.0', method: 'notifications/initialized' },
    ]), options)!)
    expect(replies).toEqual([{ jsonrpc: '2.0', id: 'a', result: {} }])
  })

  it('stdio 上逐行读写，输入结束后返回', async () => {
    const input = new PassThrough()
    const output = new PassThrough()
    const lines: string[] = []
    output.on('data', chunk => lines.push(...String(chunk).split('\n').filter(Boolean)))
    const done = serveStdio(options, input, output)
    input.write(`${JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping' })}\n\n`)
    input.end(`${JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' })}\n`)
    await done
    expect(lines.map(l => JSON.parse(l).id)).toEqual([1, 2])
  })
})
