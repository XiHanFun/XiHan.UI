/**
 * WebGPU API 封装工具
 * 提供对WebGPU API的简化访问和管理
 */

/**
 * WebGPU初始化选项
 */
export interface GpuInitOptions {
  /**
   * 是否开启验证层
   * @default false
   */
  enableValidation?: boolean;

  /**
   * 请求的首选设备特性
   */
  requiredFeatures?: GPUFeatureName[];

  /**
   * 请求的设备限制
   */
  requiredLimits?: Record<string, number>;

  /**
   * 首选适配器类型
   */
  preferredAdapterType?: "discrete" | "integrated" | "cpu" | "software";

  /**
   * 如果浏览器不支持WebGPU，是否自动回退到WebGL
   * @default false
   */
  fallbackToWebGL?: boolean;
}

/**
 * 着色器模块描述
 */
export interface ShaderModuleDescriptor {
  /**
   * 着色器代码
   */
  code: string;

  /**
   * 着色器源映射
   */
  sourceMap?: any;

  /**
   * 着色器标签
   */
  label?: string;
}

/**
 * 缓冲区用途标记
 */
export enum BufferUsage {
  /**
   * 顶点缓冲区
   */
  VERTEX = 1,

  /**
   * 索引缓冲区
   */
  INDEX = 2,

  /**
   * 统一缓冲区
   */
  UNIFORM = 4,

  /**
   * 存储缓冲区
   */
  STORAGE = 8,

  /**
   * 间接绘制命令缓冲区
   */
  INDIRECT = 16,

  /**
   * 允许从缓冲区复制
   */
  COPY_SRC = 32,

  /**
   * 允许复制到缓冲区
   */
  COPY_DST = 64,

  /**
   * 允许映射读取
   */
  MAP_READ = 128,

  /**
   * 允许映射写入
   */
  MAP_WRITE = 256,

  /**
   * 用作查询结果
   */
  QUERY_RESOLVE = 512,
}

/**
 * 渲染器状态
 */
export interface RendererState {
  /**
   * 适配器
   */
  adapter: GPUAdapter | null;

  /**
   * 设备
   */
  device: GPUDevice | null;

  /**
   * 上下文
   */
  context: GPUCanvasContext | null;

  /**
   * 呈现格式
   */
  format: GPUTextureFormat | null;

  /**
   * 画布
   */
  canvas: HTMLCanvasElement | null;

  /**
   * 是否初始化完成
   */
  isInitialized: boolean;

  /**
   * 是否支持WebGPU
   */
  isWebGPUSupported: boolean;
}

/**
 * WebGPU渲染器
 */
class GpuRenderer {
  /**
   * 当前状态
   */
  private state: RendererState;

  /**
   * 创建的着色器模块缓存
   */
  private shaderModules: Map<string, GPUShaderModule>;

  /**
   * 创建渲染器
   */
  constructor() {
    this.state = {
      adapter: null,
      device: null,
      context: null,
      format: null,
      canvas: null,
      isInitialized: false,
      isWebGPUSupported:
        typeof navigator !== "undefined" && typeof navigator.gpu !== "undefined" && navigator.gpu !== null,
    };

    this.shaderModules = new Map<string, GPUShaderModule>();
  }

  /**
   * 检查浏览器是否支持WebGPU
   * @returns 是否支持WebGPU
   */
  public isSupported(): boolean {
    return this.state.isWebGPUSupported;
  }

  /**
   * 初始化WebGPU
   * @param canvas 目标画布
   * @param options 初始化选项
   * @returns 是否初始化成功
   */
  public async initialize(canvas: HTMLCanvasElement, options: GpuInitOptions = {}): Promise<boolean> {
    if (!this.isSupported()) {
      console.error("WebGPU不受支持");
      return false;
    }

    if (this.state.isInitialized) {
      console.warn("WebGPU渲染器已初始化");
      return true;
    }

    try {
      // 请求适配器
      const adapterOptions: GPURequestAdapterOptions = {};

      if (options.preferredAdapterType) {
        adapterOptions.powerPreference = options.preferredAdapterType === "discrete" ? "high-performance" : "low-power";
      }

      const adapter = await navigator.gpu.requestAdapter(adapterOptions);

      if (!adapter) {
        throw new Error("无法获取GPU适配器");
      }

      // 请求设备
      const deviceDescriptor: GPUDeviceDescriptor = {};

      if (options.requiredFeatures) {
        deviceDescriptor.requiredFeatures = options.requiredFeatures;
      }

      if (options.requiredLimits) {
        deviceDescriptor.requiredLimits = options.requiredLimits;
      }

      const device = await adapter.requestDevice(deviceDescriptor);

      // 配置错误回调
      device.lost.then(info => {
        console.error(`WebGPU设备丢失: ${info.message}`);
        this.state.isInitialized = false;
        this.state.device = null;
      });

      device.addEventListener("uncapturederror", event => {
        console.error("WebGPU错误:", event.error);
      });

      // 配置上下文
      const context = canvas.getContext("webgpu");
      if (!context) {
        throw new Error("无法创建WebGPU上下文");
      }

      // 获取首选格式
      const format = navigator.gpu.getPreferredCanvasFormat();

      // 配置上下文
      context.configure({
        device,
        format,
        alphaMode: "premultiplied",
      });

      // 更新状态
      this.state = {
        adapter,
        device,
        context,
        format,
        canvas,
        isInitialized: true,
        isWebGPUSupported: true,
      };

      return true;
    } catch (error) {
      console.error("初始化WebGPU失败:", error);
      return false;
    }
  }

  /**
   * 获取当前WebGPU状态
   * @returns 渲染器状态
   */
  public getState(): RendererState {
    return { ...this.state };
  }

  /**
   * 获取当前GPU设备
   * @returns GPU设备
   */
  public getDevice(): GPUDevice {
    if (!this.state.device) {
      throw new Error("WebGPU设备未初始化");
    }
    return this.state.device;
  }

  /**
   * 调整画布大小
   * @param width 宽度
   * @param height 高度
   * @param devicePixelRatio 设备像素比
   */
  public resize(width: number, height: number, devicePixelRatio: number = window.devicePixelRatio || 1): void {
    if (!this.state.canvas || !this.state.context) {
      throw new Error("WebGPU未初始化");
    }

    const canvas = this.state.canvas;

    // 设置显示大小
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // 设置渲染大小
    const scaledWidth = Math.floor(width * devicePixelRatio);
    const scaledHeight = Math.floor(height * devicePixelRatio);

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    // 重新配置上下文
    this.state.context.configure({
      device: this.state.device!,
      format: this.state.format!,
      alphaMode: "premultiplied",
    });
  }

  /**
   * 创建缓冲区
   * @param data 缓冲区数据
   * @param usage 缓冲区用途
   * @param label 缓冲区标签
   * @returns GPU缓冲区
   */
  public createBuffer(data: BufferSource | null, usage: number, label: string = "Buffer"): GPUBuffer {
    const device = this.getDevice();

    const size = data ? (data instanceof ArrayBuffer ? data.byteLength : data.byteLength) : 0;

    // 确保缓冲区大小对齐
    const alignedSize = Math.ceil(size / 4) * 4;

    // 创建缓冲区
    const buffer = device.createBuffer({
      label,
      size: alignedSize,
      usage,
      mappedAtCreation: data !== null,
    });

    // 如果有数据，将数据写入缓冲区
    if (data) {
      const arrayBuffer = buffer.getMappedRange();

      if (data instanceof ArrayBuffer) {
        new Uint8Array(arrayBuffer).set(new Uint8Array(data));
      } else {
        new Uint8Array(arrayBuffer).set(new Uint8Array(data.buffer));
      }

      buffer.unmap();
    }

    return buffer;
  }

  /**
   * 创建着色器模块
   * @param descriptor 着色器模块描述符
   * @returns 着色器模块
   */
  public createShaderModule(descriptor: ShaderModuleDescriptor): GPUShaderModule {
    const device = this.getDevice();

    // 生成唯一标识
    const key =
      descriptor.label ||
      (typeof descriptor.code === "string" ? descriptor.code.slice(0, 100) : `shader_${this.shaderModules.size}`);

    // 检查缓存
    if (this.shaderModules.has(key)) {
      return this.shaderModules.get(key)!;
    }

    // 创建着色器模块
    const module = device.createShaderModule({
      label: descriptor.label,
      code: descriptor.code,
    });

    // 缓存模块
    this.shaderModules.set(key, module);

    return module;
  }

  /**
   * 创建纹理
   * @param width 宽度
   * @param height 高度
   * @param format 纹理格式
   * @param usage 纹理用途
   * @param mipLevelCount 多级渐远纹理层级数
   * @param sampleCount 采样数
   * @param label 标签
   * @returns GPU纹理
   */
  public createTexture(
    width: number,
    height: number,
    format: GPUTextureFormat,
    usage: GPUTextureUsageFlags,
    mipLevelCount: number = 1,
    sampleCount: number = 1,
    label: string = "Texture",
  ): GPUTexture {
    const device = this.getDevice();

    return device.createTexture({
      label,
      size: [width, height],
      format,
      usage,
      mipLevelCount,
      sampleCount,
    });
  }

  /**
   * 创建采样器
   * @param addressModeU U方向地址模式
   * @param addressModeV V方向地址模式
   * @param magFilter 放大过滤器
   * @param minFilter 缩小过滤器
   * @param mipmapFilter 多级渐远纹理过滤器
   * @param label 标签
   * @returns GPU采样器
   */
  public createSampler(
    addressModeU: GPUAddressMode = "repeat",
    addressModeV: GPUAddressMode = "repeat",
    magFilter: GPUFilterMode = "linear",
    minFilter: GPUFilterMode = "linear",
    mipmapFilter: GPUFilterMode = "linear",
    label: string = "Sampler",
  ): GPUSampler {
    const device = this.getDevice();

    return device.createSampler({
      label,
      addressModeU,
      addressModeV,
      magFilter,
      minFilter,
      mipmapFilter,
    });
  }

  /**
   * 创建绑定组布局
   * @param entries 布局条目
   * @param label 标签
   * @returns GPU绑定组布局
   */
  public createBindGroupLayout(
    entries: GPUBindGroupLayoutEntry[],
    label: string = "BindGroupLayout",
  ): GPUBindGroupLayout {
    const device = this.getDevice();

    return device.createBindGroupLayout({
      label,
      entries,
    });
  }

  /**
   * 创建绑定组
   * @param layout 绑定组布局
   * @param entries 绑定条目
   * @param label 标签
   * @returns GPU绑定组
   */
  public createBindGroup(
    layout: GPUBindGroupLayout,
    entries: GPUBindGroupEntry[],
    label: string = "BindGroup",
  ): GPUBindGroup {
    const device = this.getDevice();

    return device.createBindGroup({
      label,
      layout,
      entries,
    });
  }

  /**
   * 创建渲染管线
   * @param descriptor 渲染管线描述符
   * @returns GPU渲染管线
   */
  public createRenderPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline {
    const device = this.getDevice();

    return device.createRenderPipeline(descriptor);
  }

  /**
   * 创建计算管线
   * @param descriptor 计算管线描述符
   * @returns GPU计算管线
   */
  public createComputePipeline(descriptor: GPUComputePipelineDescriptor): GPUComputePipeline {
    const device = this.getDevice();

    return device.createComputePipeline(descriptor);
  }

  /**
   * 开始新的渲染通道
   * @param commandEncoder 命令编码器
   * @param descriptor 渲染通道描述符
   * @returns 渲染通道编码器
   */
  public beginRenderPass(commandEncoder: GPUCommandEncoder, descriptor: GPURenderPassDescriptor): GPURenderPassEncoder {
    return commandEncoder.beginRenderPass(descriptor);
  }

  /**
   * 开始帧渲染
   * @param clearColor 清除颜色
   * @returns 渲染通道编码器和命令编码器
   */
  public beginFrame(clearColor: GPUColor = { r: 0, g: 0, b: 0, a: 1 }): {
    renderPass: GPURenderPassEncoder;
    commandEncoder: GPUCommandEncoder;
  } {
    if (!this.state.device || !this.state.context) {
      throw new Error("WebGPU未初始化");
    }

    // 创建命令编码器
    const commandEncoder = this.state.device.createCommandEncoder();

    // 获取当前纹理视图
    const textureView = this.state.context.getCurrentTexture().createView();

    // 创建渲染通道描述符
    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: clearColor,
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    };

    // 开始渲染通道
    const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);

    return { renderPass, commandEncoder };
  }

  /**
   * 结束帧渲染
   * @param renderPass 渲染通道编码器
   * @param commandEncoder 命令编码器
   */
  public endFrame(renderPass: GPURenderPassEncoder, commandEncoder: GPUCommandEncoder): void {
    if (!this.state.device) {
      throw new Error("WebGPU未初始化");
    }

    // 结束渲染通道
    renderPass.end();

    // 提交命令
    const commandBuffer = commandEncoder.finish();
    this.state.device.queue.submit([commandBuffer]);
  }

  /**
   * 更新缓冲区数据
   * @param buffer 目标缓冲区
   * @param data 新数据
   * @param offset 偏移量
   */
  public updateBuffer(buffer: GPUBuffer, data: BufferSource, offset: number = 0): void {
    if (!this.state.device) {
      throw new Error("WebGPU未初始化");
    }

    this.state.device.queue.writeBuffer(buffer, offset, data);
  }

  /**
   * 销毁渲染器及其资源
   */
  public destroy(): void {
    // 销毁缓存的着色器模块
    this.shaderModules.clear();

    // 重置状态
    this.state = {
      adapter: null,
      device: null,
      context: null,
      format: null,
      canvas: null,
      isInitialized: false,
      isWebGPUSupported: this.state.isWebGPUSupported,
    };
  }
}

// 创建单例
export const gpuRenderer = new GpuRenderer();

/**
 * 检查WebGPU支持情况
 * @returns WebGPU支持状态
 */
export const checkWebGPUSupport = async (): Promise<{
  supported: boolean;
  features: string[];
  limits: Record<string, number>;
}> => {
  if (!gpuRenderer.isSupported()) {
    return {
      supported: false,
      features: [],
      limits: {},
    };
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      return {
        supported: false,
        features: [],
        limits: {},
      };
    }

    // 获取支持的特性
    const features = Array.from(adapter.features).map(feature => feature.toString());

    // 获取设备限制
    const limits: Record<string, number> = {};
    for (const key in adapter.limits) {
      if (typeof adapter.limits[key as keyof GPUSupportedLimits] === "number") {
        limits[key] = adapter.limits[key as keyof GPUSupportedLimits] as number;
      }
    }

    return {
      supported: true,
      features,
      limits,
    };
  } catch (error) {
    console.error("检查WebGPU支持时出错:", error);
    return {
      supported: false,
      features: [],
      limits: {},
    };
  }
};

/**
 * 创建WebGPU渲染循环
 * @param callback 渲染回调
 * @param options 渲染选项
 * @returns 停止渲染函数
 */
export const createRenderLoop = (
  callback: (time: number, delta: number) => void,
  options: {
    maxFPS?: number;
    vsync?: boolean;
  } = {},
): (() => void) => {
  const { maxFPS = 60, vsync = true } = options;

  let lastTime = 0;
  let animationFrameId: number;
  let running = true;

  // 计算帧间时间
  const frameDuration = 1000 / maxFPS;

  // 渲染函数
  const render = (time: number) => {
    if (!running) return;

    const delta = time - lastTime;

    // 限制帧率
    if (vsync || delta >= frameDuration) {
      lastTime = time;
      callback(time, delta);
    }

    animationFrameId = requestAnimationFrame(render);
  };

  // 开始渲染
  animationFrameId = requestAnimationFrame(render);

  // 返回停止函数
  return () => {
    running = false;
    cancelAnimationFrame(animationFrameId);
  };
};

/**
 * 创建计算着色器调度
 * @param device GPU设备
 * @param pipeline 计算管线
 * @param bindGroups 绑定组列表
 * @param workgroupCountX X维度工作组数量
 * @param workgroupCountY Y维度工作组数量
 * @param workgroupCountZ Z维度工作组数量
 */
export const dispatchCompute = (
  device: GPUDevice,
  pipeline: GPUComputePipeline,
  bindGroups: GPUBindGroup[],
  workgroupCountX: number,
  workgroupCountY: number = 1,
  workgroupCountZ: number = 1,
): void => {
  // 创建命令编码器
  const commandEncoder = device.createCommandEncoder();

  // 开始计算通道
  const computePass = commandEncoder.beginComputePass();

  // 设置管线
  computePass.setPipeline(pipeline);

  // 设置绑定组
  for (let i = 0; i < bindGroups.length; i++) {
    computePass.setBindGroup(i, bindGroups[i]);
  }

  // 调度计算工作组
  computePass.dispatchWorkgroups(workgroupCountX, workgroupCountY, workgroupCountZ);

  // 结束计算通道
  computePass.end();

  // 提交命令
  const commandBuffer = commandEncoder.finish();
  device.queue.submit([commandBuffer]);
};

// 默认导出同时提供命名空间对象
export const gpuUtils = {
  gpuRenderer,
  checkWebGPUSupport,
  createRenderLoop,
  dispatchCompute,
  BufferUsage,
};

// 默认导出命名空间对象
export default gpuUtils;
