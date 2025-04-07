/**
 * 蓝牙 API 封装
 * 提供Web蓝牙API的简化操作
 */

// Web 蓝牙 API 类型定义
declare global {
  interface Navigator {
    bluetooth: {
      requestDevice(options: RequestDeviceOptions): Promise<Bluetooth.Device>;
    };
  }

  namespace Bluetooth {
    interface Device {
      id: string;
      name?: string;
      gatt?: RemoteGATTServer;
      addEventListener(type: "gattserverdisconnected", listener: (this: Device, ev: Event) => any): void;
      removeEventListener(type: "gattserverdisconnected", listener: (this: Device, ev: Event) => any): void;
    }

    interface RemoteGATTServer {
      connected: boolean;
      connect(): Promise<RemoteGATTServer>;
      disconnect(): void;
      getPrimaryService(service: string): Promise<RemoteGATTService>;
      getPrimaryServices(): Promise<RemoteGATTService[]>;
    }

    interface RemoteGATTService {
      getCharacteristic(characteristic: string): Promise<RemoteGATTCharacteristic>;
      getCharacteristics(): Promise<RemoteGATTCharacteristic[]>;
    }

    interface RemoteGATTCharacteristic {
      value?: DataView;
      readValue(): Promise<DataView>;
      writeValue(value: BufferSource): Promise<void>;
      startNotifications(): Promise<RemoteGATTCharacteristic>;
      stopNotifications(): Promise<RemoteGATTCharacteristic>;
      addEventListener(
        type: "characteristicvaluechanged",
        listener: (this: RemoteGATTCharacteristic, ev: Event) => any,
      ): void;
      removeEventListener(
        type: "characteristicvaluechanged",
        listener: (this: RemoteGATTCharacteristic, ev: Event) => any,
      ): void;
    }
  }

  interface RequestDeviceOptions {
    filters?: Array<{
      services?: string[];
      name?: string;
      namePrefix?: string;
      manufacturerData?: Array<{
        companyIdentifier: number;
        dataPrefix?: BufferSource;
        mask?: BufferSource;
      }>;
    }>;
    optionalServices?: string[];
    acceptAllDevices?: boolean;
  }
}

/**
 * 设备过滤选项
 */
export interface BluetoothFilterOptions {
  /**
   * 服务UUID，用于过滤设备
   */
  services?: string[];

  /**
   * 设备名称
   */
  name?: string;

  /**
   * 设备名称前缀
   */
  namePrefix?: string;

  /**
   * 制造商数据
   */
  manufacturerData?: Array<{
    companyIdentifier: number;
    dataPrefix?: BufferSource;
    mask?: BufferSource;
  }>;
}

/**
 * 蓝牙设备连接选项
 */
export interface BluetoothConnectOptions extends BluetoothFilterOptions {
  /**
   * 是否允许选择任意设备(安全风险)
   */
  acceptAllDevices?: boolean;

  /**
   * 可选服务
   */
  optionalServices?: string[];
}

/**
 * 蓝牙特征操作选项
 */
export interface BluetoothCharacteristicOptions {
  /**
   * 服务UUID
   */
  serviceUUID: string;

  /**
   * 特征UUID
   */
  characteristicUUID: string;
}

/**
 * 蓝牙通知监听器
 */
export interface BluetoothNotificationListener {
  /**
   * 监听函数
   */
  callback: (value: DataView) => void;

  /**
   * 服务UUID
   */
  serviceUUID: string;

  /**
   * 特征UUID
   */
  characteristicUUID: string;
}

/**
 * 检查蓝牙API是否可用
 */
export function isBluetoothSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "bluetooth" in navigator &&
    typeof (navigator.bluetooth as any).requestDevice === "function"
  );
}

/**
 * 蓝牙设备管理器
 */
export class BluetoothDevice {
  /**
   * 内部设备对象
   */
  private device: Bluetooth.Device | null = null;

  /**
   * GATT服务器
   */
  private server: Bluetooth.RemoteGATTServer | null = null;

  /**
   * 服务缓存
   */
  private services: Map<string, Bluetooth.RemoteGATTService> = new Map();

  /**
   * 特征缓存
   */
  private characteristics: Map<string, Bluetooth.RemoteGATTCharacteristic> = new Map();

  /**
   * 通知监听器
   */
  private notificationListeners: BluetoothNotificationListener[] = [];

  /**
   * 连接状态改变回调
   */
  private connectionCallback: ((connected: boolean) => void) | null = null;

  /**
   * 是否已连接
   */
  private isConnected: boolean = false;

  /**
   * 获取内部蓝牙设备
   */
  getDevice(): Bluetooth.Device | null {
    return this.device;
  }

  /**
   * 蓝牙设备是否已连接
   */
  isDeviceConnected(): boolean {
    return this.isConnected && this.server !== null && this.server.connected;
  }

  /**
   * 连接到蓝牙设备
   * @param options 连接选项
   */
  async connect(options: BluetoothConnectOptions): Promise<Bluetooth.Device> {
    if (!isBluetoothSupported()) {
      throw new Error("当前浏览器不支持蓝牙API");
    }

    try {
      // 请求设备
      const requestOptions: RequestDeviceOptions = {
        acceptAllDevices: options.acceptAllDevices || false,
      };

      // 如果不接受所有设备，则必须有过滤条件
      if (!options.acceptAllDevices) {
        requestOptions.filters = [];

        if (options.services) {
          requestOptions.filters.push({ services: options.services });
        }

        if (options.name) {
          requestOptions.filters.push({ name: options.name });
        }

        if (options.namePrefix) {
          requestOptions.filters.push({ namePrefix: options.namePrefix });
        }

        if (options.manufacturerData) {
          requestOptions.filters.push({ manufacturerData: options.manufacturerData });
        }

        // 如果没有添加任何过滤器，至少添加一个空服务过滤器
        if (requestOptions.filters.length === 0) {
          throw new Error("必须指定至少一个过滤条件或者启用接受所有设备");
        }
      }

      // 添加可选服务
      if (options.optionalServices && options.optionalServices.length > 0) {
        requestOptions.optionalServices = options.optionalServices;
      }

      // 合并服务列表到可选服务
      if (options.services && options.services.length > 0) {
        if (!requestOptions.optionalServices) {
          requestOptions.optionalServices = [];
        }

        options.services.forEach(service => {
          if (!requestOptions.optionalServices!.includes(service)) {
            requestOptions.optionalServices!.push(service);
          }
        });
      }

      // 选择设备
      this.device = await navigator.bluetooth.requestDevice(requestOptions);

      // 添加断开连接事件监听
      this.device.addEventListener("gattserverdisconnected", this.handleDisconnection.bind(this));

      // 连接到GATT服务器
      if (this.device.gatt) {
        this.server = await this.device.gatt.connect();
        this.isConnected = true;
      } else {
        throw new Error("设备不支持GATT");
      }

      // 触发连接回调
      if (this.connectionCallback) {
        this.connectionCallback(true);
      }

      return this.device;
    } catch (error) {
      console.error("蓝牙设备连接失败:", error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * 断开蓝牙设备连接
   */
  disconnect(): void {
    if (this.server && this.server.connected) {
      this.server.disconnect();
    }

    this.isConnected = false;
    this.server = null;
    this.services.clear();
    this.characteristics.clear();

    // 触发连接回调
    if (this.connectionCallback) {
      this.connectionCallback(false);
    }
  }

  /**
   * 处理设备断开连接
   */
  private handleDisconnection(): void {
    this.isConnected = false;
    this.server = null;
    this.services.clear();
    this.characteristics.clear();

    // 触发连接回调
    if (this.connectionCallback) {
      this.connectionCallback(false);
    }
  }

  /**
   * 设置连接状态改变回调
   * @param callback 回调函数
   */
  onConnectionChanged(callback: (connected: boolean) => void): void {
    this.connectionCallback = callback;
  }

  /**
   * 获取指定服务
   * @param serviceUUID 服务UUID
   */
  async getService(serviceUUID: string): Promise<Bluetooth.RemoteGATTService> {
    // 检查设备是否已连接
    if (!this.isDeviceConnected()) {
      throw new Error("蓝牙设备未连接");
    }

    // 检查缓存
    if (this.services.has(serviceUUID)) {
      return this.services.get(serviceUUID)!;
    }

    try {
      // 获取服务
      const service = await this.server!.getPrimaryService(serviceUUID);
      this.services.set(serviceUUID, service);
      return service;
    } catch (error) {
      console.error(`获取服务 ${serviceUUID} 失败:`, error);
      throw error;
    }
  }

  /**
   * 获取指定特征
   * @param options 特征选项
   */
  async getCharacteristic(options: BluetoothCharacteristicOptions): Promise<Bluetooth.RemoteGATTCharacteristic> {
    const { serviceUUID, characteristicUUID } = options;

    // 生成特征缓存键
    const characteristicKey = `${serviceUUID}:${characteristicUUID}`;

    // 检查缓存
    if (this.characteristics.has(characteristicKey)) {
      return this.characteristics.get(characteristicKey)!;
    }

    try {
      // 获取服务
      const service = await this.getService(serviceUUID);

      // 获取特征
      const characteristic = await service.getCharacteristic(characteristicUUID);
      this.characteristics.set(characteristicKey, characteristic);

      return characteristic;
    } catch (error) {
      console.error(`获取特征 ${characteristicKey} 失败:`, error);
      throw error;
    }
  }

  /**
   * 读取特征值
   * @param options 特征选项
   */
  async readValue(options: BluetoothCharacteristicOptions): Promise<DataView> {
    try {
      const characteristic = await this.getCharacteristic(options);
      return await characteristic.readValue();
    } catch (error) {
      console.error(`读取特征值失败:`, error);
      throw error;
    }
  }

  /**
   * 写入特征值
   * @param options 特征选项
   * @param value 写入的值
   */
  async writeValue(options: BluetoothCharacteristicOptions, value: BufferSource): Promise<void> {
    try {
      const characteristic = await this.getCharacteristic(options);
      await characteristic.writeValue(value);
    } catch (error) {
      console.error(`写入特征值失败:`, error);
      throw error;
    }
  }

  /**
   * 启用特征值通知
   * @param options 特征选项
   * @param callback 通知回调
   */
  async startNotifications(
    options: BluetoothCharacteristicOptions,
    callback: (value: DataView) => void,
  ): Promise<void> {
    try {
      const { serviceUUID, characteristicUUID } = options;
      const characteristic = await this.getCharacteristic(options);

      // 注册回调
      const onCharacteristicValueChanged = (event: Event) => {
        const target = event.target as unknown as Bluetooth.RemoteGATTCharacteristic;
        if (target && target.value) {
          callback(target.value);
        }
      };

      // 绑定通知事件
      characteristic.addEventListener("characteristicvaluechanged", onCharacteristicValueChanged);

      // 启用通知
      await characteristic.startNotifications();

      // 保存监听器信息
      this.notificationListeners.push({
        callback: onCharacteristicValueChanged as any,
        serviceUUID,
        characteristicUUID,
      });
    } catch (error) {
      console.error(`启用特征值通知失败:`, error);
      throw error;
    }
  }

  /**
   * 停止特征值通知
   * @param options 特征选项
   */
  async stopNotifications(options: BluetoothCharacteristicOptions): Promise<void> {
    try {
      const { serviceUUID, characteristicUUID } = options;
      const characteristic = await this.getCharacteristic(options);

      // 查找相关监听器
      const listeners = this.notificationListeners.filter(
        listener => listener.serviceUUID === serviceUUID && listener.characteristicUUID === characteristicUUID,
      );

      // 移除事件监听并停止通知
      for (const listener of listeners) {
        characteristic.removeEventListener("characteristicvaluechanged", listener.callback as any);
      }

      // 停止通知
      await characteristic.stopNotifications();

      // 从列表中移除
      this.notificationListeners = this.notificationListeners.filter(
        listener => !(listener.serviceUUID === serviceUUID && listener.characteristicUUID === characteristicUUID),
      );
    } catch (error) {
      console.error(`停止特征值通知失败:`, error);
      throw error;
    }
  }

  /**
   * 获取所有服务
   */
  async getServices(): Promise<Bluetooth.RemoteGATTService[]> {
    if (!this.isDeviceConnected()) {
      throw new Error("蓝牙设备未连接");
    }

    try {
      return await this.server!.getPrimaryServices();
    } catch (error) {
      console.error(`获取所有服务失败:`, error);
      throw error;
    }
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo(): {
    id: string;
    name?: string;
    connected: boolean;
  } | null {
    if (!this.device) {
      return null;
    }

    return {
      id: this.device.id,
      name: this.device.name,
      connected: this.isDeviceConnected(),
    };
  }
}

/**
 * 创建蓝牙设备管理器
 */
export function createBluetoothDevice(): BluetoothDevice {
  return new BluetoothDevice();
}

/**
 * 将字符串转换为ArrayBuffer
 * @param str 字符串
 */
export function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer as ArrayBuffer;
}

/**
 * 将ArrayBuffer转换为字符串
 * @param buffer ArrayBuffer数据
 */
export function arrayBufferToString(buffer: ArrayBuffer | DataView): string {
  const dataView = buffer instanceof DataView ? buffer : new DataView(buffer);
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(dataView);
}

/**
 * 将ArrayBuffer转换为十六进制字符串
 * @param buffer ArrayBuffer数据
 */
export function arrayBufferToHex(buffer: ArrayBuffer | DataView): string {
  const dataView =
    buffer instanceof DataView
      ? new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
      : new Uint8Array(buffer);

  return Array.from(dataView)
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * 将十六进制字符串转换为ArrayBuffer
 * @param hex 十六进制字符串
 */
export function hexToArrayBuffer(hex: string): ArrayBuffer {
  if (hex.length % 2 !== 0) {
    throw new Error("十六进制字符串长度必须是偶数");
  }

  const length = hex.length / 2;
  const buffer = new ArrayBuffer(length);
  const uint8Array = new Uint8Array(buffer);

  for (let i = 0; i < length; i++) {
    const byteHex = hex.substr(i * 2, 2);
    uint8Array[i] = parseInt(byteHex, 16);
  }

  return buffer;
}

/**
 * 连接低功耗蓝牙设备
 * @param options 连接选项
 */
export async function connectBLE(options: BluetoothConnectOptions): Promise<BluetoothDevice> {
  const device = new BluetoothDevice();
  await device.connect(options);
  return device;
}

/**
 * 扫描附近的蓝牙设备
 * @param options 过滤选项
 * @param timeout 扫描超时(毫秒)
 */
export async function scanBluetoothDevices(
  options: BluetoothFilterOptions = {},
  timeout: number = 10000,
): Promise<BluetoothDevice[]> {
  // Web蓝牙API不支持直接扫描设备，这里提供一个模拟实现
  // 实际上用户需要手动选择设备
  throw new Error("Web蓝牙API不支持直接扫描设备，请使用connectBLE方法让用户选择设备");
}

// 同时提供命名空间对象
export const bluetoothUtils = {
  isBluetoothSupported,
  createBluetoothDevice,
  connectBLE,
  stringToArrayBuffer,
  arrayBufferToString,
  arrayBufferToHex,
  hexToArrayBuffer,
};

// 默认导出命名空间对象
export default bluetoothUtils;
