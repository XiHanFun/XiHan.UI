/**
 * Web Credentials API 封装工具
 * 提供凭据管理功能，支持密码管理和WebAuthn
 */

// 添加类型声明
declare global {
  interface Window {
    PasswordCredential: typeof PasswordCredential;
    FederatedCredential: typeof FederatedCredential;
  }

  // 将接口改为可构造的类声明
  var PasswordCredential: {
    prototype: PasswordCredential;
    new (options: PasswordCredentialOptions | HTMLFormElement): PasswordCredential;
  };

  var FederatedCredential: {
    prototype: FederatedCredential;
    new (options: FederatedCredentialOptions): FederatedCredential;
  };

  interface PasswordCredential extends Credential {
    readonly type: "password";
    readonly password: string;
    readonly name?: string;
    readonly iconURL?: string;
  }

  interface FederatedCredential extends Credential {
    readonly type: "federated";
    readonly provider: string;
    readonly protocol?: string;
    readonly name?: string;
    readonly iconURL?: string;
  }

  interface CredentialsContainer {
    create(options: CredentialCreationOptions): Promise<Credential | null>;
    get(options?: CredentialRequestOptions): Promise<Credential | null>;
    store(credential: Credential): Promise<Credential>;
    preventSilentAccess(): Promise<void>;
    delete?(options?: any): Promise<boolean>;
  }
}

/**
 * 凭据类型
 */
export enum CredentialType {
  /**
   * 密码凭据
   */
  PASSWORD = "password",

  /**
   * 联合ID凭据
   */
  FEDERATED = "federated",

  /**
   * 公钥凭据（WebAuthn）
   */
  PUBLIC_KEY = "public-key",
}

/**
 * 密码凭据选项
 */
export interface PasswordCredentialOptions {
  /**
   * 凭据ID
   */
  id: string;

  /**
   * 密码
   */
  password: string;

  /**
   * 用户名
   */
  name?: string;

  /**
   * 图标URL
   */
  iconURL?: string;
}

/**
 * 联合身份凭据选项
 */
export interface FederatedCredentialOptions {
  /**
   * 凭据ID
   */
  id: string;

  /**
   * 身份提供者
   */
  provider: string;

  /**
   * 用户名
   */
  name?: string;

  /**
   * 图标URL
   */
  iconURL?: string;

  /**
   * 协议
   */
  protocol?: string;
}

/**
 * 凭据请求选项
 */
export interface CredentialRequestOptions {
  /**
   * 是否静默获取凭据
   */
  silent?: boolean;

  /**
   * 是否仅获取密码凭据
   */
  password?: boolean;

  /**
   * 联合身份提供者列表
   */
  federated?: {
    providers: string[];
    protocols?: string[];
  };

  /**
   * 公钥凭据请求选项
   */
  publicKey?: PublicKeyCredentialRequestOptions;

  /**
   * 是否禁用自动选择
   */
  unmediated?: boolean;

  /**
   * 凭据媒体类型
   */
  mediation?: "silent" | "optional" | "required" | "conditional";
}

/**
 * 凭据存储选项
 */
export interface CredentialCreationOptions {
  /**
   * 密码凭据选项
   */
  password?: PasswordCredentialOptions;

  /**
   * 联合身份凭据选项
   */
  federated?: FederatedCredentialOptions;

  /**
   * 公钥凭据创建选项
   */
  publicKey?: PublicKeyCredentialCreationOptions;
}

/**
 * 检查浏览器是否支持Credential Management API
 * @returns 是否支持凭据管理
 */
export const isCredentialsSupported = (): boolean => {
  return typeof window !== "undefined" && typeof navigator !== "undefined" && !!navigator.credentials;
};

/**
 * 检查浏览器是否支持WebAuthn
 * @returns 是否支持WebAuthn
 */
export const isWebAuthnSupported = (): boolean => {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.credentials &&
    typeof navigator.credentials.create === "function" &&
    typeof window.PublicKeyCredential !== "undefined"
  );
};

/**
 * 检查浏览器是否支持自动填充
 * @returns 是否支持自动填充
 */
export const isAutofillSupported = (): boolean => {
  return typeof window !== "undefined" && typeof document !== "undefined" && !!window.PasswordCredential;
};

/**
 * 请求用户凭据
 * @param options 凭据请求选项
 * @returns 用户凭据，如果用户未选择则返回null
 */
export const getCredentials = async (options: CredentialRequestOptions = {}): Promise<Credential | null> => {
  if (!isCredentialsSupported()) {
    throw new Error("您的浏览器不支持凭据管理API");
  }

  try {
    return await navigator.credentials.get(options);
  } catch (error) {
    console.error("获取凭据失败", error);
    return null;
  }
};

/**
 * 根据密码凭据登录
 * @param credential 密码凭据
 * @returns 凭据信息对象
 */
export const loginWithCredential = (credential: PasswordCredential): Record<string, any> => {
  if (!credential || credential.type !== CredentialType.PASSWORD) {
    throw new Error("无效的密码凭据");
  }

  // 将凭据转换为表单数据或JSON对象
  return {
    id: credential.id,
    name: credential.name,
    password: credential.password,
    type: credential.type,
  };
};

/**
 * 存储用户凭据
 * @param options 凭据创建选项
 * @returns 存储的凭据，如果用户拒绝则返回null
 */
export const storeCredential = async (options: CredentialCreationOptions): Promise<Credential | null> => {
  if (!isCredentialsSupported()) {
    throw new Error("您的浏览器不支持凭据管理API");
  }

  try {
    let credential = null;

    // 创建密码凭据
    if (options.password) {
      credential = new PasswordCredential(options.password);
    }
    // 创建联合身份凭据
    else if (options.federated) {
      credential = new FederatedCredential(options.federated);
    }
    // 创建公钥凭据
    else if (options.publicKey) {
      credential = await navigator.credentials.create({
        publicKey: options.publicKey,
      });
    }

    if (credential) {
      // 存储凭据
      await navigator.credentials.store(credential);
    }

    return credential;
  } catch (error) {
    console.error("存储凭据失败", error);
    return null;
  }
};

/**
 * 创建密码凭据
 * @param id 凭据ID（通常是用户名或邮箱）
 * @param password 密码
 * @param name 用户名
 * @param iconURL 图标URL
 * @returns 密码凭据对象
 */
export const createPasswordCredential = (
  id: string,
  password: string,
  name?: string,
  iconURL?: string,
): PasswordCredential => {
  if (!isAutofillSupported()) {
    throw new Error("您的浏览器不支持密码凭据");
  }

  return new PasswordCredential({
    id,
    password,
    name,
    iconURL,
  });
};

/**
 * 创建联合身份凭据
 * @param id 凭据ID
 * @param provider 身份提供者
 * @param name 用户名
 * @param iconURL 图标URL
 * @param protocol 协议
 * @returns 联合身份凭据对象
 */
export const createFederatedCredential = (
  id: string,
  provider: string,
  name?: string,
  iconURL?: string,
  protocol?: string,
): FederatedCredential => {
  if (!isCredentialsSupported() || !window.FederatedCredential) {
    throw new Error("您的浏览器不支持联合身份凭据");
  }

  return new FederatedCredential({
    id,
    provider,
    name,
    iconURL,
    protocol,
  });
};

/**
 * 从表单创建密码凭据
 * @param form 表单元素
 * @returns 密码凭据对象
 */
export const createPasswordCredentialFromForm = (form: HTMLFormElement): PasswordCredential => {
  if (!isAutofillSupported()) {
    throw new Error("您的浏览器不支持密码凭据");
  }

  return new PasswordCredential(form);
};

/**
 * 防止自动登录
 * 调用此函数可以阻止浏览器自动使用已保存的凭据
 */
export const preventSilentAccess = async (): Promise<void> => {
  if (isCredentialsSupported() && navigator.credentials.preventSilentAccess) {
    try {
      await navigator.credentials.preventSilentAccess();
    } catch (error) {
      console.error("防止自动登录失败", error);
    }
  }
};

/**
 * 清除浏览器中保存的凭据（注意：大多数浏览器不支持此功能）
 * @param filters 凭据筛选器，例如 { id: 'user@example.com' }
 * @returns 是否成功
 */
export const clearCredentials = async (filters?: Record<string, any>): Promise<boolean> => {
  if (!isCredentialsSupported()) {
    throw new Error("您的浏览器不支持凭据管理API");
  }

  try {
    // 使用非标准API（如果可用）
    if (navigator.credentials.delete) {
      // 注意：不是所有浏览器都支持delete方法
      await (navigator.credentials as any).delete(filters);
      return true;
    }

    // 替代方法：使用preventSilentAccess来阻止自动登录
    await preventSilentAccess();
    return false;
  } catch (error) {
    console.error("清除凭据失败", error);
    return false;
  }
};

/**
 * 注册WebAuthn凭据（生物识别、安全密钥等）
 * @param username 用户名
 * @param displayName 显示名称
 * @param challenge 挑战（随机生成的值）
 * @param rpId 依赖方ID（通常是域名）
 * @param userIdBytes 用户ID字节数组
 * @param timeout 超时时间（毫秒）
 * @returns WebAuthn注册响应
 */
export const registerWebAuthnCredential = async (
  username: string,
  displayName: string,
  challenge: BufferSource,
  rpId: string,
  userIdBytes: Uint8Array,
  timeout: number = 60000,
): Promise<PublicKeyCredential | null> => {
  if (!isWebAuthnSupported()) {
    throw new Error("您的浏览器不支持WebAuthn");
  }

  // 创建公钥凭据参数
  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: document.location.hostname,
      id: rpId || document.location.hostname,
    },
    user: {
      id: userIdBytes,
      name: username,
      displayName: displayName,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 }, // ES256
      { type: "public-key", alg: -257 }, // RS256
    ],
    timeout,
    attestation: "direct",
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "preferred",
      requireResidentKey: false,
    },
  };

  try {
    return (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential;
  } catch (error) {
    console.error("WebAuthn注册失败", error);
    return null;
  }
};

/**
 * 使用WebAuthn凭据验证
 * @param challenge 挑战（随机生成的值）
 * @param rpId 依赖方ID（通常是域名）
 * @param allowCredentials 允许的凭据ID列表
 * @param timeout 超时时间（毫秒）
 * @returns WebAuthn验证响应
 */
export const verifyWebAuthnCredential = async (
  challenge: BufferSource,
  rpId?: string,
  allowCredentials?: PublicKeyCredentialDescriptor[],
  timeout: number = 60000,
): Promise<PublicKeyCredential | null> => {
  if (!isWebAuthnSupported()) {
    throw new Error("您的浏览器不支持WebAuthn");
  }

  // 创建公钥凭据请求参数
  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge,
    timeout,
    rpId: rpId || document.location.hostname,
  };

  if (allowCredentials && allowCredentials.length > 0) {
    publicKeyCredentialRequestOptions.allowCredentials = allowCredentials;
  }

  try {
    return (await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    })) as PublicKeyCredential;
  } catch (error) {
    console.error("WebAuthn验证失败", error);
    return null;
  }
};

/**
 * 生成随机挑战值
 * @param length 挑战值的字节长度
 * @returns 随机生成的挑战值
 */
export const generateChallenge = (length: number = 32): Uint8Array => {
  const challenge = new Uint8Array(length);

  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(challenge);
  } else {
    // 如果不支持crypto API，使用Math.random作为后备方案
    for (let i = 0; i < length; i++) {
      challenge[i] = Math.floor(Math.random() * 256);
    }
  }

  return challenge;
};

/**
 * 将ArrayBuffer转换为Base64 URL编码的字符串
 * @param buffer ArrayBuffer数据
 * @returns Base64 URL编码的字符串
 */
export const arrayBufferToBase64Url = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let base64 = "";

  for (let i = 0; i < bytes.byteLength; i++) {
    base64 += String.fromCharCode(bytes[i]);
  }

  return btoa(base64).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

/**
 * 将Base64 URL编码的字符串转换为ArrayBuffer
 * @param base64url Base64 URL编码的字符串
 * @returns ArrayBuffer数据
 */
export const base64UrlToArrayBuffer = (base64url: string): ArrayBuffer => {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");

  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Padded = base64 + padding;

  const binaryString = atob(base64Padded);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
};

// 同时提供命名空间对象
export const credentialsUtils = {
  CredentialType,
  isCredentialsSupported,
  isWebAuthnSupported,
  isAutofillSupported,
  getCredentials,
  loginWithCredential,
  storeCredential,
  createPasswordCredential,
  createFederatedCredential,
  createPasswordCredentialFromForm,
  preventSilentAccess,
  clearCredentials,
  registerWebAuthnCredential,
  verifyWebAuthnCredential,
  generateChallenge,
  arrayBufferToBase64Url,
  base64UrlToArrayBuffer,
};

// 默认导出命名空间对象
export default credentialsUtils;
