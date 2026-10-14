/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/cli：XiHan.UI 的离线知识库、命令行与 MCP 服务端。

export type { CliEnvironment } from './cli'
export { runCli } from './cli'
export type {
  ComponentEntry,
  Framework,
  Knowledge,
  PageEntry,
  TokenEntry,
} from './knowledge'
export { loadKnowledge } from './knowledge'
export type { McpServerOptions } from './mcp'
export { handleMessage, PROTOCOL_VERSIONS, serveStdio } from './mcp'
export type { PromptDefinition, ToolContext, ToolDefinition } from './tools'
export { PROMPTS, TOOLS } from './tools'
