/**
 * 大语言模型集成工具
 * 提供LLM调用与处理能力
 */

/**
 * 模型提供商类型
 */
export type LLMProvider = "openai" | "azure-openai" | "google" | "anthropic" | "huggingface" | "local" | "custom";

/**
 * LLM服务配置选项
 */
export interface LLMServiceConfig {
  /**
   * 服务提供商
   */
  provider: LLMProvider;

  /**
   * API密钥
   */
  apiKey?: string;

  /**
   * API端点URL
   */
  endpoint?: string;

  /**
   * 模型名称
   */
  model?: string;

  /**
   * 组织ID (适用于OpenAI)
   */
  organization?: string;

  /**
   * 请求超时时间(毫秒)
   */
  timeout?: number;

  /**
   * 最大重试次数
   */
  maxRetries?: number;

  /**
   * 代理URL
   */
  proxyUrl?: string;

  /**
   * 自定义请求头
   */
  headers?: Record<string, string>;
}

/**
 * 消息类型定义
 */
export interface Message {
  /**
   * 消息角色
   */
  role: "system" | "user" | "assistant" | "function" | string;

  /**
   * 消息内容
   */
  content: string;

  /**
   * 消息名称(可选)
   */
  name?: string;

  /**
   * 函数调用(可选)
   */
  functionCall?: {
    name: string;
    arguments: string;
  };
}

/**
 * 完成选项接口
 */
export interface CompletionOptions {
  /**
   * 温度 (0-2)
   */
  temperature?: number;

  /**
   * 最大令牌数
   */
  maxTokens?: number;

  /**
   * 是否启用流式响应
   */
  stream?: boolean;

  /**
   * 停止序列
   */
  stop?: string[];

  /**
   * 是否包含用法统计
   */
  includeUsage?: boolean;

  /**
   * 多样性惩罚
   */
  presencePenalty?: number;

  /**
   * 重复惩罚
   */
  frequencyPenalty?: number;

  /**
   * 响应格式
   */
  responseFormat?: "text" | "json";

  /**
   * 可用的函数定义
   */
  functions?: FunctionDefinition[];

  /**
   * 其他参数
   */
  [key: string]: any;
}

/**
 * 函数定义接口
 */
export interface FunctionDefinition {
  /**
   * 函数名称
   */
  name: string;

  /**
   * 函数描述
   */
  description?: string;

  /**
   * 函数参数定义(JSON Schema格式)
   */
  parameters?: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
    [key: string]: any;
  };
}

/**
 * 完成响应接口
 */
export interface CompletionResponse {
  /**
   * 生成的文本
   */
  text: string;

  /**
   * 完整的消息
   */
  message?: Message;

  /**
   * 函数调用结果
   */
  functionCall?: {
    name: string;
    arguments: Record<string, any>;
  };

  /**
   * 令牌使用统计
   */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };

  /**
   * 完成总耗时(毫秒)
   */
  durationMs?: number;
}

/**
 * 流响应消息处理回调
 */
export type StreamCallback = (chunk: {
  text: string;
  isComplete: boolean;
  functionCall?: {
    name: string;
    arguments: string;
  };
}) => void;

/**
 * LLM服务类
 */
export class LLMService {
  private config: LLMServiceConfig;
  private abortController: AbortController | null = null;

  /**
   * 创建LLM服务实例
   * @param config 服务配置
   */
  constructor(config: LLMServiceConfig) {
    this.config = {
      ...config,
      timeout: config.timeout || 60000,
      maxRetries: config.maxRetries || 3,
    };
  }

  /**
   * 文本补全(单轮对话)
   * @param prompt 提示文本
   * @param options 完成选项
   */
  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResponse> {
    return this.chat([{ role: "user", content: prompt }], options);
  }

  /**
   * 聊天对话补全(多轮对话)
   * @param messages 消息数组
   * @param options 完成选项
   */
  async chat(messages: Message[], options: CompletionOptions = {}): Promise<CompletionResponse> {
    const startTime = Date.now();

    if (options.stream) {
      throw new Error("非流式调用中不应设置stream=true，请使用streamChat方法");
    }

    // 创建新的AbortController用于超时控制
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    // 设置超时
    const timeoutId = setTimeout(() => {
      if (this.abortController) {
        this.abortController.abort("请求超时");
      }
    }, this.config.timeout || 60000);

    try {
      // 根据提供商选择不同的实现
      let result: CompletionResponse;

      switch (this.config.provider) {
        case "openai":
          result = await this.callOpenAI(messages, options, signal);
          break;
        case "azure-openai":
          result = await this.callAzureOpenAI(messages, options, signal);
          break;
        case "google":
          result = await this.callGoogle(messages, options, signal);
          break;
        case "anthropic":
          result = await this.callAnthropic(messages, options, signal);
          break;
        case "huggingface":
          result = await this.callHuggingFace(messages, options, signal);
          break;
        case "local":
          result = await this.callLocalModel(messages, options);
          break;
        case "custom":
          result = await this.callCustomEndpoint(messages, options, signal);
          break;
        default:
          throw new Error(`不支持的提供商: ${this.config.provider}`);
      }

      // 计算总耗时
      result.durationMs = Date.now() - startTime;

      return result;
    } finally {
      clearTimeout(timeoutId);
      this.abortController = null;
    }
  }

  /**
   * 流式聊天补全
   * @param messages 消息数组
   * @param callback 流回调函数
   * @param options 完成选项
   */
  async streamChat(
    messages: Message[],
    callback: StreamCallback,
    options: CompletionOptions = {},
  ): Promise<CompletionResponse> {
    const startTime = Date.now();

    // 创建新的AbortController用于超时控制
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    // 设置超时
    const timeoutId = setTimeout(() => {
      if (this.abortController) {
        this.abortController.abort("请求超时");
      }
    }, this.config.timeout || 60000);

    try {
      // 强制设置流式选项
      const streamOptions = { ...options, stream: true };

      // 根据提供商选择不同的实现
      let result: CompletionResponse;

      switch (this.config.provider) {
        case "openai":
          result = await this.streamOpenAI(messages, callback, streamOptions, signal);
          break;
        case "azure-openai":
          result = await this.streamAzureOpenAI(messages, callback, streamOptions, signal);
          break;
        case "anthropic":
          result = await this.streamAnthropic(messages, callback, streamOptions, signal);
          break;
        case "google":
          result = await this.streamGoogle(messages, callback, streamOptions, signal);
          break;
        default:
          throw new Error(`提供商 ${this.config.provider} 不支持流式输出或尚未实现`);
      }

      // 计算总耗时
      result.durationMs = Date.now() - startTime;

      return result;
    } finally {
      clearTimeout(timeoutId);
      this.abortController = null;
    }
  }

  /**
   * 终止当前请求
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort("用户取消请求");
      this.abortController = null;
    }
  }

  /**
   * 调用OpenAI API
   * @private
   */
  private async callOpenAI(
    messages: Message[],
    options: CompletionOptions,
    signal: AbortSignal,
  ): Promise<CompletionResponse> {
    if (!this.config.apiKey) {
      throw new Error("使用OpenAI时必须提供apiKey");
    }

    const endpoint = this.config.endpoint || "https://api.openai.com/v1/chat/completions";

    const modelName = this.config.model || "gpt-3.5-turbo";

    const payload = {
      model: modelName,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        ...(msg.name ? { name: msg.name } : {}),
        ...(msg.functionCall ? { function_call: msg.functionCall } : {}),
      })),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      top_p: 1,
      frequency_penalty: options.frequencyPenalty ?? 0,
      presence_penalty: options.presencePenalty ?? 0,
      ...(options.stop ? { stop: options.stop } : {}),
      ...(options.responseFormat
        ? {
            response_format: { type: options.responseFormat },
          }
        : {}),
      ...(options.functions
        ? {
            functions: options.functions,
            function_call: options.functionCall || "auto",
          }
        : {}),
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
          ...(this.config.organization ? { "OpenAI-Organization": this.config.organization } : {}),
          ...(this.config.headers || {}),
        },
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API请求失败: ${response.status} ${response.statusText} - ${
            errorData.error?.message || JSON.stringify(errorData)
          }`,
        );
      }

      const data = await response.json();

      // 处理完成响应
      if (!data.choices || data.choices.length === 0) {
        throw new Error("OpenAI返回了空的响应");
      }

      const choice = data.choices[0];
      const message = choice.message;

      // 处理函数调用
      let functionCall = undefined;
      if (message.function_call) {
        try {
          functionCall = {
            name: message.function_call.name,
            arguments: JSON.parse(message.function_call.arguments),
          };
        } catch (e) {
          functionCall = {
            name: message.function_call.name,
            arguments: { text: message.function_call.arguments },
          };
        }
      }

      // 格式化响应
      return {
        text: message.content || "",
        message: {
          role: message.role,
          content: message.content || "",
          ...(message.name ? { name: message.name } : {}),
          ...(message.function_call
            ? {
                functionCall: {
                  name: message.function_call.name,
                  arguments: message.function_call.arguments,
                },
              }
            : {}),
        },
        functionCall,
        usage: options.includeUsage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("请求已取消或超时");
        }
        throw error;
      }
      throw new Error(`调用OpenAI API时出错: ${String(error)}`);
    }
  }

  /**
   * 流式调用OpenAI API
   * @private
   */
  private async streamOpenAI(
    messages: Message[],
    callback: StreamCallback,
    options: CompletionOptions,
    signal: AbortSignal,
  ): Promise<CompletionResponse> {
    if (!this.config.apiKey) {
      throw new Error("使用OpenAI时必须提供apiKey");
    }

    const endpoint = this.config.endpoint || "https://api.openai.com/v1/chat/completions";

    const modelName = this.config.model || "gpt-3.5-turbo";

    const payload = {
      model: modelName,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        ...(msg.name ? { name: msg.name } : {}),
        ...(msg.functionCall ? { function_call: msg.functionCall } : {}),
      })),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      top_p: 1,
      frequency_penalty: options.frequencyPenalty ?? 0,
      presence_penalty: options.presencePenalty ?? 0,
      stream: true,
      ...(options.stop ? { stop: options.stop } : {}),
      ...(options.responseFormat
        ? {
            response_format: { type: options.responseFormat },
          }
        : {}),
      ...(options.functions
        ? {
            functions: options.functions,
            function_call: options.functionCall || "auto",
          }
        : {}),
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
          ...(this.config.organization ? { "OpenAI-Organization": this.config.organization } : {}),
          ...(this.config.headers || {}),
        },
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API请求失败: ${response.status} ${response.statusText} - ${
            errorData.error?.message || JSON.stringify(errorData)
          }`,
        );
      }

      if (!response.body) {
        throw new Error("响应没有可读的流");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";
      let functionName = "";
      let functionArgs = "";
      let currentDelta = "";
      let roleSet = false;
      let role = "assistant";

      // 处理流式响应
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.trim() || line.trim() === "data: [DONE]") continue;

          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (!data.choices || data.choices.length === 0) continue;

              const delta = data.choices[0].delta;

              // 设置角色(通常只在第一个块中)
              if (delta.role && !roleSet) {
                role = delta.role;
                roleSet = true;
              }

              // 处理文本内容
              if (delta.content) {
                fullText += delta.content;
                currentDelta = delta.content;
              }

              // 处理函数调用
              if (delta.function_call) {
                if (delta.function_call.name) {
                  functionName = delta.function_call.name;
                }

                if (delta.function_call.arguments) {
                  functionArgs += delta.function_call.arguments;
                }
              }

              // 调用回调
              const isComplete = data.choices[0].finish_reason !== null;
              callback({
                text: currentDelta,
                isComplete,
                ...(delta.function_call
                  ? {
                      functionCall: {
                        name: functionName,
                        arguments: functionArgs,
                      },
                    }
                  : {}),
              });

              currentDelta = "";
            } catch (e) {
              console.error("解析流式数据出错:", e);
            }
          }
        }
      }

      // 构建完整响应对象
      let functionCall = undefined;
      if (functionName && functionArgs) {
        try {
          functionCall = {
            name: functionName,
            arguments: JSON.parse(functionArgs),
          };
        } catch {
          functionCall = {
            name: functionName,
            arguments: { text: functionArgs },
          };
        }
      }

      return {
        text: fullText,
        message: {
          role,
          content: fullText,
          ...(functionName
            ? {
                functionCall: {
                  name: functionName,
                  arguments: functionArgs,
                },
              }
            : {}),
        },
        functionCall,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("请求已取消或超时");
        }
        throw error;
      }
      throw new Error(`调用OpenAI流式API时出错: ${String(error)}`);
    }
  }

  /**
   * 调用Azure OpenAI API
   * @private
   */
  private async callAzureOpenAI(
    messages: Message[],
    options: CompletionOptions,
    signal: AbortSignal,
  ): Promise<CompletionResponse> {
    // Azure OpenAI实现类似于OpenAI，但有不同的端点和认证
    // 暂未实现，后续版本提供
    throw new Error("Azure OpenAI集成尚未实现");
  }

  /**
   * 流式调用Azure OpenAI API
   * @private
   */
  private async streamAzureOpenAI(
    messages: Message[],
    callback: StreamCallback,
    options: CompletionOptions,
    signal: AbortSignal,
  ): Promise<CompletionResponse> {
    // 暂未实现，后续版本提供
    throw new Error("Azure OpenAI流式集成尚未实现");
  }

  /**
   * 调用Google的生成式AI
   * @private
   */
  private async callGoogle(
    messages: Message[],
    options: CompletionOptions,
    signal: AbortSignal,
  ): Promise<CompletionResponse> {
    // 暂未实现，后续版本提供
    throw new Error("Google PaLM/Gemini集成尚未实现");
  }

  /**
   * 流式调用Google的生成式AI
   * @private
   */
  private async streamGoogle(
    messages: Message[],
    callback: StreamCallback,
    options: CompletionOptions,
    signal: AbortSignal,
  ): Promise<CompletionResponse> {
    // 暂未实现，后续版本提供
    throw new Error("Google PaLM/Gemini流式集成尚未实现");
  }

  /**
   * 调用Anthropic的Claude API
   * @private
   */
  private async callAnthropic(
    messages: Message[],
    options: CompletionOptions,
    signal: AbortSignal,
  ): Promise<CompletionResponse> {
    // 暂未实现，后续版本提供
    throw new Error("Anthropic Claude集成尚未实现");
  }

  /**
   * 流式调用Anthropic的Claude API
   * @private
   */
  private async streamAnthropic(
    messages: Message[],
    callback: StreamCallback,
    options: CompletionOptions,
    signal: AbortSignal,
  ): Promise<CompletionResponse> {
    // 暂未实现，后续版本提供
    throw new Error("Anthropic Claude流式集成尚未实现");
  }

  /**
   * 调用Hugging Face模型
   * @private
   */
  private async callHuggingFace(
    messages: Message[],
    options: CompletionOptions,
    signal: AbortSignal,
  ): Promise<CompletionResponse> {
    // 暂未实现，后续版本提供
    throw new Error("Hugging Face集成尚未实现");
  }

  /**
   * 调用本地语言模型
   * @private
   */
  private async callLocalModel(messages: Message[], options: CompletionOptions): Promise<CompletionResponse> {
    // 这需要在客户端集成如llama.cpp或其他本地模型运行时
    throw new Error("本地模型集成尚未实现");
  }

  /**
   * 调用自定义语言模型端点
   * @private
   */
  private async callCustomEndpoint(
    messages: Message[],
    options: CompletionOptions,
    signal: AbortSignal,
  ): Promise<CompletionResponse> {
    if (!this.config.endpoint) {
      throw new Error("使用自定义端点时必须提供endpoint");
    }

    try {
      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
          ...(this.config.headers || {}),
        },
        body: JSON.stringify({
          messages,
          ...options,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`自定义API请求失败: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();

      // 尝试根据标准格式解析响应
      return {
        text: data.content || data.text || "",
        message: {
          role: data.role || "assistant",
          content: data.content || data.text || "",
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("请求已取消或超时");
        }
        throw error;
      }
      throw new Error(`调用自定义端点时出错: ${String(error)}`);
    }
  }
}

/**
 * 创建LLM服务
 * @param config 服务配置
 */
export function createLLMService(config: LLMServiceConfig): LLMService {
  return new LLMService(config);
}

/**
 * 简单完成工具(单轮对话)
 * @param prompt 提示文本
 * @param apiKey API密钥
 * @param provider 提供商
 */
export async function completeSimple(
  prompt: string,
  apiKey: string,
  provider: LLMProvider = "openai",
): Promise<string> {
  const service = createLLMService({ provider, apiKey });
  const response = await service.complete(prompt);
  return response.text;
}

// 同时提供命名空间对象
export const llm = {
  LLMService,
  createLLMService,
  completeSimple,
};

// 默认导出命名空间对象
export default llm;
