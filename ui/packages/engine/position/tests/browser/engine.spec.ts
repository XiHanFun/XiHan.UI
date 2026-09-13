/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 engine 相关行为。

import { runPositionEngine } from '@xihan-ui/testing/position'
import { describe, it } from 'vitest'
import { createPositionEngine } from '../../src/index'

runPositionEngine(createPositionEngine(), { describe, it }, '自研')
