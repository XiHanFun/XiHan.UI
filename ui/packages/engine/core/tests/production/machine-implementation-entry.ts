/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 machine implementation entry 相关行为。

export {
  onDiagnostic,
  resetDiagnostics,
  setDiagnosticsConsoleOutput,
  setDiagnosticsDedupe,
  setDiagnosticsLevel,
} from '../../src/kernel/diagnostics/channel'
export { isDev } from '../../src/kernel/utils/dev'
export { createMachine } from '../../src/machine/create-machine'
export { MachineError } from '../../src/machine/errors'
export { COMBINATOR } from '../../src/machine/guards'
export { createVanillaRuntime } from '../../src/machine/reactive/vanilla'
export { createService } from '../../src/machine/service'
export { setup } from '../../src/machine/setup'
