/**
 * WebAssembly 辅助工具
 * 提供WebAssembly模块的加载、实例化和管理功能
 */

/**
 * WebAssembly模块描述
 */
export interface WasmModuleDescriptor {
  /**
   * 模块名称
   */
  name: string;

  /**
   * 模块URL路径
   */
  url: string;

  /**
   * 导入对象
   */
  imports?: WebAssembly.Imports;

  /**
   * 缓存模块
   */
  cache?: boolean;
}

/**
 * WebAssembly模块信息
 */
export interface WasmModuleInfo {
  /**
   * 模块名称
   */
  name: string;

  /**
   * WebAssembly模块
   */
  module: WebAssembly.Module;

  /**
   * WebAssembly实例
   */
  instance: WebAssembly.Instance;

  /**
   * 模块导出
   */
  exports: WebAssembly.Exports;

  /**
   * 内存对象（如果可用）
   */
  memory?: WebAssembly.Memory;

  /**
   * 加载时间（毫秒）
   */
  loadTime: number;
}

/**
 * WebAssembly模块进度事件
 */
export interface WasmProgressEvent {
  /**
   * 模块名称
   */
  name: string;

  /**
   * 已加载字节数
   */
  loaded: number;

  /**
   * 总字节数
   */
  total: number;

  /**
   * 加载进度（0-1）
   */
  progress: number;
}

/**
 * WebAssembly模块管理器
 */
class WasmModuleManager {
  /**
   * 已加载的模块映射表
   */
  private modules: Map<string, WasmModuleInfo>;

  /**
   * 初始化WebAssembly模块管理器
   */
  constructor() {
    this.modules = new Map<string, WasmModuleInfo>();
  }

  /**
   * 检查浏览器是否支持WebAssembly
   * @returns 是否支持WebAssembly
   */
  public isSupported(): boolean {
    return (
      typeof WebAssembly !== "undefined" &&
      typeof WebAssembly.compile === "function" &&
      typeof WebAssembly.instantiate === "function"
    );
  }

  /**
   * 检查浏览器是否支持WebAssembly流式编译
   * @returns 是否支持流式编译
   */
  public isStreamingSupported(): boolean {
    return this.isSupported() && typeof WebAssembly.instantiateStreaming === "function";
  }

  /**
   * 加载WebAssembly模块
   * @param descriptor 模块描述
   * @param onProgress 进度回调
   * @returns 加载后的模块信息
   */
  public async loadModule(
    descriptor: WasmModuleDescriptor,
    onProgress?: (event: WasmProgressEvent) => void,
  ): Promise<WasmModuleInfo> {
    if (!this.isSupported()) {
      throw new Error("您的浏览器不支持WebAssembly");
    }

    const { name, url, imports = {}, cache = true } = descriptor;

    // 检查是否已加载
    if (this.modules.has(name)) {
      return this.modules.get(name)!;
    }

    const startTime = performance.now();

    try {
      let instance: WebAssembly.Instance;
      let module: WebAssembly.Module;

      // 使用流式编译（如果支持）
      if (this.isStreamingSupported()) {
        const response = await fetch(url);
        const contentLength = Number(response.headers.get("Content-Length") || "0");

        // 创建进度读取器
        if (onProgress && contentLength > 0) {
          const reader = response.body!.getReader();
          const stream = new ReadableStream({
            async start(controller) {
              let loaded = 0;

              try {
                while (true) {
                  const { done, value } = await reader.read();

                  if (done) {
                    controller.close();
                    break;
                  }

                  loaded += value.byteLength;
                  controller.enqueue(value);

                  // 报告进度
                  onProgress({
                    name,
                    loaded,
                    total: contentLength,
                    progress: loaded / contentLength,
                  });
                }
              } catch (error) {
                controller.error(error);
              }
            },
          });

          const streamResponse = new Response(stream, {
            headers: response.headers,
          });

          const result = await WebAssembly.instantiateStreaming(streamResponse, imports);
          module = result.module;
          instance = result.instance;
        } else {
          // 不需要进度报告，直接使用流式编译
          const result = await WebAssembly.instantiateStreaming(fetch(url), imports);
          module = result.module;
          instance = result.instance;
        }
      } else {
        // 不支持流式编译，使用传统方法
        const response = await fetch(url);
        const contentLength = Number(response.headers.get("Content-Length") || "0");
        const buffer = await response.arrayBuffer();

        if (onProgress && contentLength > 0) {
          onProgress({
            name,
            loaded: buffer.byteLength,
            total: contentLength,
            progress: 1.0,
          });
        }

        module = await WebAssembly.compile(buffer);
        instance = await WebAssembly.instantiate(module, imports);
      }

      // 获取内存对象（如果存在）
      let memory: WebAssembly.Memory | undefined;
      if (instance.exports.memory && instance.exports.memory instanceof WebAssembly.Memory) {
        memory = instance.exports.memory as WebAssembly.Memory;
      } else if (imports.env && imports.env.memory && imports.env.memory instanceof WebAssembly.Memory) {
        memory = imports.env.memory as WebAssembly.Memory;
      }

      const moduleInfo: WasmModuleInfo = {
        name,
        module,
        instance,
        exports: instance.exports,
        memory,
        loadTime: performance.now() - startTime,
      };

      // 缓存模块
      if (cache) {
        this.modules.set(name, moduleInfo);
      }

      return moduleInfo;
    } catch (error) {
      console.error(`加载WebAssembly模块 ${name} 失败:`, error);
      throw error;
    }
  }

  /**
   * 获取已加载的模块
   * @param name 模块名称
   * @returns 模块信息或null（如果未找到）
   */
  public getModule(name: string): WasmModuleInfo | null {
    return this.modules.get(name) || null;
  }

  /**
   * 卸载WebAssembly模块
   * @param name 模块名称
   * @returns 是否成功卸载
   */
  public unloadModule(name: string): boolean {
    return this.modules.delete(name);
  }

  /**
   * 清除所有WebAssembly模块
   */
  public clearModules(): void {
    this.modules.clear();
  }

  /**
   * 获取已加载的模块列表
   * @returns 模块名称数组
   */
  public getLoadedModules(): string[] {
    return Array.from(this.modules.keys());
  }

  /**
   * 调用WebAssembly模块的导出函数
   * @param moduleName 模块名称
   * @param functionName 函数名称
   * @param args 函数参数
   * @returns 函数返回值
   */
  public callFunction(moduleName: string, functionName: string, ...args: any[]): any {
    const moduleInfo = this.getModule(moduleName);
    if (!moduleInfo) {
      throw new Error(`模块 ${moduleName} 未加载`);
    }

    const func = moduleInfo.exports[functionName];
    if (typeof func !== "function") {
      throw new Error(`函数 ${functionName} 在模块 ${moduleName} 中不存在或不是函数`);
    }

    return func(...args);
  }

  /**
   * 创建WebAssembly内存对象
   * @param initialPages 初始内存页数（每页64KB）
   * @param maximumPages 最大内存页数
   * @returns WebAssembly内存对象
   */
  public createMemory(initialPages: number = 1, maximumPages?: number): WebAssembly.Memory {
    return new WebAssembly.Memory({
      initial: initialPages,
      maximum: maximumPages,
    });
  }

  /**
   * 创建WebAssembly表对象
   * @param initialSize 初始表大小
   * @param maximumSize 最大表大小
   * @returns WebAssembly表对象
   */
  public createTable(initialSize: number = 0, maximumSize?: number): WebAssembly.Table {
    return new WebAssembly.Table({
      initial: initialSize,
      maximum: maximumSize,
      element: "anyfunc",
    });
  }

  /**
   * 从WebAssembly内存中读取字符串
   * @param memory WebAssembly内存
   * @param offset 字符串起始偏移量
   * @param length 字符串长度（如果未指定，则读取到null字符）
   * @returns 解码后的字符串
   */
  public readString(memory: WebAssembly.Memory, offset: number, length?: number): string {
    const view = new Uint8Array(memory.buffer, offset);

    if (length === undefined) {
      // 如果没有指定长度，读取到null终止符
      let end = offset;
      while (view[end - offset] !== 0) {
        end++;
      }
      length = end - offset;
    }

    // 使用TextDecoder解码UTF-8字符串
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(view.slice(0, length));
  }

  /**
   * 将字符串写入WebAssembly内存
   * @param memory WebAssembly内存
   * @param string 要写入的字符串
   * @param offset 写入起始偏移量
   * @param nullTerminate 是否添加null终止符
   * @returns 写入的字节数
   */
  public writeString(
    memory: WebAssembly.Memory,
    string: string,
    offset: number,
    nullTerminate: boolean = true,
  ): number {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(string);
    const view = new Uint8Array(memory.buffer, offset);

    // 复制字符串
    view.set(bytes);

    // 添加null终止符
    if (nullTerminate) {
      view[bytes.length] = 0;
      return bytes.length + 1;
    }

    return bytes.length;
  }

  /**
   * 分配WebAssembly内存
   * @param memory WebAssembly内存
   * @param size 分配大小（字节）
   * @param align 对齐要求（2的幂）
   * @returns 分配的内存地址
   *
   * 注意：这是一个简单的实现，不包括内存管理
   * 实际应用中应当使用WebAssembly模块中的内存分配器
   */
  public allocateMemory(memory: WebAssembly.Memory, size: number, align: number = 8): number {
    // 这里仅作为示例，实际上应该使用更复杂的内存管理
    // 在真实环境中，应该使用模块导出的alloc/malloc函数

    // 这里简单地使用第一页末尾的内存
    const ALLOC_START = 65536 - 1024; // 第一页末尾的1KB

    // 对齐地址
    const alignMask = align - 1;
    const alignedAddress = (ALLOC_START + alignMask) & ~alignMask;

    if (alignedAddress + size > memory.buffer.byteLength) {
      // 内存不足，尝试增长
      const requiredPages = Math.ceil((alignedAddress + size - memory.buffer.byteLength) / 65536);
      memory.grow(requiredPages);
    }

    return alignedAddress;
  }
}

// 创建单例
export const wasmManager = new WasmModuleManager();

/**
 * 加载WebAssembly模块
 * @param url 模块URL
 * @param imports 导入对象
 * @param onProgress 进度回调
 * @returns 加载后的模块信息
 */
export const loadWasmModule = async (
  url: string,
  imports: WebAssembly.Imports = {},
  onProgress?: (event: WasmProgressEvent) => void,
): Promise<WasmModuleInfo> => {
  // 从URL生成模块名称
  const name = url.split("/").pop()!.split(".")[0];

  return wasmManager.loadModule(
    {
      name,
      url,
      imports,
      cache: true,
    },
    onProgress,
  );
};

/**
 * 创建与WebAssembly模块交互的辅助对象
 * @param moduleInfo 模块信息
 * @returns 辅助对象
 */
export const createWasmHelper = (moduleInfo: WasmModuleInfo) => {
  return {
    /**
     * 调用模块导出函数
     * @param name 函数名
     * @param args 函数参数
     * @returns 函数返回值
     */
    call: (name: string, ...args: any[]) => {
      const func = moduleInfo.exports[name];
      if (typeof func !== "function") {
        throw new Error(`函数 ${name} 不存在或不是函数`);
      }
      return func(...args);
    },

    /**
     * 获取模块导出内存
     * @returns WebAssembly内存对象
     */
    getMemory: (): WebAssembly.Memory => {
      if (!moduleInfo.memory) {
        throw new Error("模块未提供内存导出");
      }
      return moduleInfo.memory;
    },

    /**
     * 读取内存中的字符串
     * @param offset 字符串偏移量
     * @param length 字符串长度
     * @returns 字符串
     */
    readString: (offset: number, length?: number): string => {
      if (!moduleInfo.memory) {
        throw new Error("模块未提供内存导出");
      }
      return wasmManager.readString(moduleInfo.memory, offset, length);
    },

    /**
     * 写入字符串到内存
     * @param string 字符串
     * @param offset 偏移量
     * @param nullTerminate 是否添加null终止符
     * @returns 写入的字节数
     */
    writeString: (string: string, offset: number, nullTerminate: boolean = true): number => {
      if (!moduleInfo.memory) {
        throw new Error("模块未提供内存导出");
      }
      return wasmManager.writeString(moduleInfo.memory, string, offset, nullTerminate);
    },

    /**
     * 创建指向导出函数的函数包装器
     * @param name 函数名
     * @returns 包装函数
     */
    createFunction: <T extends (...args: any[]) => any>(name: string): T => {
      const func = moduleInfo.exports[name];
      if (typeof func !== "function") {
        throw new Error(`函数 ${name} 不存在或不是函数`);
      }
      return func as T;
    },

    /**
     * 获取原始模块信息
     */
    getModuleInfo: () => moduleInfo,
  };
};

// 同时提供命名空间对象
export const wasmUtils = {
  wasmManager,
  loadWasmModule,
  createWasmHelper,
};

// 默认导出命名空间对象
export default wasmUtils;
