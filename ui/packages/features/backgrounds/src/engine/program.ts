// 着色器程序：编译、链接、uniform 与 attribute 位置缓存。
// 编译失败不抛异常——一张背景画不出来不该把宿主组件带崩，走诊断通道报出来再降级。

import type { UniformValue } from '../types'
import { DIAGNOSTIC_CODES, reportDiagnostic } from '@xihan-ui/core'

export interface GlProgram {
  readonly handle: WebGLProgram
  readonly uniform: (name: string, value: UniformValue) => void
  readonly attrib: (name: string) => number
  readonly dispose: () => void
}

function compile(gl: WebGL2RenderingContext, type: number, source: string, label: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (shader === null)
    return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    reportDiagnostic({
      code: DIAGNOSTIC_CODES.warn,
      level: 'error',
      message: `[backgrounds] 着色器编译失败（${label}）：${gl.getShaderInfoLog(shader) ?? ''}`,
    })
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function createProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
  label: string,
): GlProgram | null {
  const vs = compile(gl, gl.VERTEX_SHADER, vertexSource, `${label}/vertex`)
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentSource, `${label}/fragment`)
  if (vs === null || fs === null) {
    if (vs !== null)
      gl.deleteShader(vs)
    if (fs !== null)
      gl.deleteShader(fs)
    return null
  }

  const handle = gl.createProgram()
  if (handle === null) {
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    return null
  }

  gl.attachShader(handle, vs)
  gl.attachShader(handle, fs)
  gl.linkProgram(handle)
  gl.deleteShader(vs)
  gl.deleteShader(fs)

  if (!gl.getProgramParameter(handle, gl.LINK_STATUS)) {
    reportDiagnostic({
      code: DIAGNOSTIC_CODES.warn,
      level: 'error',
      message: `[backgrounds] 着色器链接失败（${label}）：${gl.getProgramInfoLog(handle) ?? ''}`,
    })
    gl.deleteProgram(handle)
    return null
  }

  const uniforms = new Map<string, WebGLUniformLocation | null>()
  const attribs = new Map<string, number>()

  return {
    handle,
    uniform(name: string, value: UniformValue): void {
      if (!uniforms.has(name))
        uniforms.set(name, gl.getUniformLocation(handle, name))
      const loc = uniforms.get(name)
      if (loc === null || loc === undefined)
        return
      if (typeof value === 'number') {
        gl.uniform1f(loc, value)
        return
      }
      switch (value.length) {
        case 2:
          gl.uniform2f(loc, value[0]!, value[1]!)
          break
        case 3:
          gl.uniform3f(loc, value[0]!, value[1]!, value[2]!)
          break
        case 4:
          gl.uniform4f(loc, value[0]!, value[1]!, value[2]!, value[3]!)
          break
        default:
          break
      }
    },
    attrib(name: string): number {
      if (!attribs.has(name))
        attribs.set(name, gl.getAttribLocation(handle, name))
      return attribs.get(name) ?? -1
    },
    dispose(): void {
      gl.deleteProgram(handle)
    },
  }
}
