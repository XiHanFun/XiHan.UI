import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { applyAction, checkAction, planSetup, serverCommand } from '../src/setup'

let root: string

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'xihan-ui-setup-'))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

describe('serverCommand', () => {
  it('钉住版本经 npx 启动', () => {
    expect(serverCommand('cursor', '4.1.0', 'linux')).toEqual({ command: 'npx', args: ['-y', '@xihan-ui/cli@4.1.0', 'mcp'] })
  })

  it('windows 上的 Claude Code 经 cmd /c 调 npx', () => {
    expect(serverCommand('claude', '4.1.0', 'win32')).toEqual({ command: 'cmd', args: ['/c', 'npx', '-y', '@xihan-ui/cli@4.1.0', 'mcp'] })
    expect(serverCommand('vscode', '4.1.0', 'win32').command).toBe('npx')
  })
})

describe('planSetup', () => {
  it('各客户端写到各自的配置文件', () => {
    const plan = (client: 'claude' | 'cursor' | 'vscode') => planSetup({ client, mode: 'mcp', root, version: '4.1.0', platform: 'linux' })[0]
    expect(plan('claude')).toMatchObject({ kind: 'json', path: join(root, '.mcp.json'), key: 'mcpServers' })
    expect(plan('cursor')).toMatchObject({ kind: 'json', path: join(root, '.cursor', 'mcp.json'), key: 'mcpServers' })
    expect(plan('vscode')).toMatchObject({ kind: 'json', path: join(root, '.vscode', 'mcp.json'), key: 'servers', entry: { type: 'stdio' } })
  })

  it('codex 只打印 config.toml 片段', () => {
    const [action] = planSetup({ client: 'codex', mode: 'mcp', root, version: '4.1.0', platform: 'linux' })
    expect(action).toEqual({
      kind: 'print',
      target: '~/.codex/config.toml',
      content: '[mcp_servers.xihan-ui]\ncommand = "npx"\nargs = ["-y", "@xihan-ui/cli@4.1.0", "mcp"]',
    })
  })

  it('skill 模式写技能文件：Claude Code 写 .claude/skills，其余写 .agents/skills', () => {
    const claude = planSetup({ client: 'claude', mode: 'skill', root, version: '4.1.0', platform: 'linux' })
    expect(claude).toHaveLength(1)
    expect(claude[0]).toMatchObject({ kind: 'file', path: join(root, '.claude', 'skills', 'xihan-ui', 'SKILL.md') })
    const cursor = planSetup({ client: 'cursor', mode: 'both', root, version: '4.1.0', platform: 'linux' })
    expect(cursor.map(a => a.kind)).toEqual(['json', 'file'])
    expect(cursor[1]).toMatchObject({ path: join(root, '.agents', 'skills', 'xihan-ui', 'SKILL.md') })
  })
})

describe('applyAction / checkAction', () => {
  it('只改 xihan-ui 一项，保留已有服务与其他字段', () => {
    const path = join(root, '.mcp.json')
    writeFileSync(path, JSON.stringify({ mcpServers: { other: { command: 'x' } }, extra: true }))
    const [action] = planSetup({ client: 'claude', mode: 'mcp', root, version: '4.1.0', platform: 'linux' })
    expect(checkAction(action!)).toContain('没有 xihan-ui')
    applyAction(action!)
    const config = JSON.parse(readFileSync(path, 'utf8'))
    expect(config.extra).toBe(true)
    expect(config.mcpServers.other).toEqual({ command: 'x' })
    expect(config.mcpServers['xihan-ui']).toEqual({ command: 'npx', args: ['-y', '@xihan-ui/cli@4.1.0', 'mcp'] })
    expect(checkAction(action!)).toBeUndefined()
  })

  it('版本不同时判为不一致', () => {
    const [old] = planSetup({ client: 'cursor', mode: 'mcp', root, version: '4.0.0', platform: 'linux' })
    applyAction(old!)
    const [current] = planSetup({ client: 'cursor', mode: 'mcp', root, version: '4.1.0', platform: 'linux' })
    expect(checkAction(current!)).toContain('与期望不一致')
  })

  it('配置文件解析不了时报错且不改动文件', () => {
    const path = join(root, '.mcp.json')
    writeFileSync(path, '{ // 注释\n}')
    const [action] = planSetup({ client: 'claude', mode: 'mcp', root, version: '4.1.0', platform: 'linux' })
    expect(() => applyAction(action!)).toThrow(/无法解析/)
    expect(readFileSync(path, 'utf8')).toBe('{ // 注释\n}')
  })

  it('技能文件写入后核对通过', () => {
    const [action] = planSetup({ client: 'claude', mode: 'skill', root, version: '4.1.0', platform: 'linux' })
    expect(checkAction(action!)).toContain('缺少')
    applyAction(action!)
    expect(readFileSync(join(root, '.claude', 'skills', 'xihan-ui', 'SKILL.md'), 'utf8')).toMatch(/^---\nname: xihan-ui\n/)
    expect(checkAction(action!)).toBeUndefined()
  })
})
