/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 runtime contract 相关行为。

import { useMachine } from '../src/runtime/use-machine'
import { describeRuntimeContract } from './support/runtime-contract'

describeRuntimeContract('react', useMachine)
