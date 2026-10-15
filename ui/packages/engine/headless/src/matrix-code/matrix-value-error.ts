/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 二维码编码器在内容装不下或选项越界时抛出的错误。

/** 编码器能报出的问题码。 */
export type MatrixValueErrorCode = 'capacity-exceeded' | 'invalid-columns'

/** 编码器抛出的错误：`message` 是说明，`code` 是对应的问题码。 */
export class MatrixValueError extends RangeError {
  readonly code: MatrixValueErrorCode

  constructor(code: MatrixValueErrorCode, message: string) {
    super(message)
    this.code = code
  }
}
