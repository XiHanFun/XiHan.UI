/**
 * Web Payment API 封装工具
 * 提供便捷的支付功能调用，包括Payment Request API
 */

/**
 * 支付方式接口
 */
export interface PaymentMethod {
  /**
   * 支持的支付方式
   */
  supportedMethods: string;

  /**
   * 支付方式的附加数据
   */
  data?: Record<string, any>;
}

/**
 * 支付详情接口
 */
export interface PaymentDetails {
  /**
   * 总金额
   */
  total: {
    label: string;
    amount: {
      currency: string;
      value: string;
    };
  };

  /**
   * 显示项目
   */
  displayItems?: Array<{
    label: string;
    amount: {
      currency: string;
      value: string;
    };
  }>;

  /**
   * 运费选项
   */
  shippingOptions?: Array<{
    id: string;
    label: string;
    amount: {
      currency: string;
      value: string;
    };
    selected?: boolean;
  }>;

  /**
   * 修饰符
   */
  modifiers?: Array<{
    supportedMethods: string;
    total?: {
      label: string;
      amount: {
        currency: string;
        value: string;
      };
    };
    additionalDisplayItems?: Array<{
      label: string;
      amount: {
        currency: string;
        value: string;
      };
    }>;
    data?: Record<string, any>;
  }>;

  /**
   * 错误信息
   */
  error?: string;

  /**
   * 支付ID
   */
  id?: string;
}

/**
 * 支付选项接口
 */
export interface PaymentOptions {
  /**
   * 是否请求送货信息
   */
  requestShipping?: boolean;

  /**
   * 是否请求支付人信息
   */
  requestPayerName?: boolean;

  /**
   * 是否请求支付人邮箱
   */
  requestPayerEmail?: boolean;

  /**
   * 是否请求支付人电话
   */
  requestPayerPhone?: boolean;

  /**
   * 送货类型
   */
  shippingType?: "shipping" | "delivery" | "pickup";
}

/**
 * 支付响应对象
 * 注意：为了与浏览器原生PaymentResponse类型兼容，这里使用string | null类型
 */
export interface CustomPaymentResponse {
  /**
   * 支付方式的详细信息
   */
  details: Record<string, any>;

  /**
   * 支付方式信息
   */
  methodName: string;

  /**
   * 支付人姓名
   */
  payerName?: string | null;

  /**
   * 支付人邮箱
   */
  payerEmail?: string | null;

  /**
   * 支付人电话
   */
  payerPhone?: string | null;

  /**
   * 送货地址
   */
  shippingAddress?: {
    recipient: string;
    addressLine: string[];
    city: string;
    region: string;
    country: string;
    postalCode: string;
    phone: string;
  } | null;

  /**
   * 选择的送货方式ID
   */
  shippingOption?: string | null;

  /**
   * 完成支付方法
   */
  complete: (result?: "success" | "fail" | "unknown") => Promise<void>;

  /**
   * 重试支付方法
   */
  retry?: () => Promise<void>;
}

/**
 * 检查浏览器是否支持Payment Request API
 * @returns 是否支持支付API
 */
export const isPaymentSupported = (): boolean => {
  return typeof window !== "undefined" && !!window.PaymentRequest;
};

/**
 * 检查浏览器是否支持特定的支付方式
 * @param method 支付方式标识符
 * @returns 支付方式是否可用
 */
export const isPaymentMethodSupported = async (method: string): Promise<boolean> => {
  if (!isPaymentSupported()) {
    return false;
  }

  // 创建最小支付请求
  const supportedMethods = [{ supportedMethods: method }];
  const details = {
    total: {
      label: "Test",
      amount: { currency: "USD", value: "1.00" },
    },
  };

  try {
    // 尝试创建支付请求对象
    const request = new PaymentRequest(supportedMethods, details);
    return true;
  } catch (error) {
    // 如果创建失败，则表示不支持该支付方式
    return false;
  }
};

/**
 * 常用的支付方式标识
 */
export const PaymentMethodIdentifiers = {
  /**
   * 基本卡支付
   */
  BASIC_CARD: "basic-card",

  /**
   * Google Pay
   */
  GOOGLE_PAY: "https://google.com/pay",

  /**
   * Apple Pay
   */
  APPLE_PAY: "https://apple.com/apple-pay",

  /**
   * 支付宝
   */
  ALIPAY: "https://www.alipay.com/webpay",

  /**
   * 微信支付
   */
  WECHAT_PAY: "https://pay.weixin.qq.com/",

  /**
   * PayPal
   */
  PAYPAL: "https://www.paypal.com/webpay",
};

/**
 * 创建基本卡支付方式
 * @param networks 支持的卡网络
 * @param types 支持的卡类型
 * @returns 支付方式对象
 */
export const createBasicCardPayment = (
  networks?: Array<"visa" | "mastercard" | "amex" | "discover" | "jcb" | "unionpay">,
  types?: Array<"credit" | "debit" | "prepaid">,
): PaymentMethod => {
  return {
    supportedMethods: PaymentMethodIdentifiers.BASIC_CARD,
    data: {
      supportedNetworks: networks || ["visa", "mastercard", "amex"],
      supportedTypes: types || ["credit", "debit"],
    },
  };
};

/**
 * 创建Google Pay支付方式
 * @param merchantId 商户ID
 * @param merchantName 商户名称
 * @param gatewayId 支付网关ID
 * @returns 支付方式对象
 */
export const createGooglePayment = (merchantId: string, merchantName: string, gatewayId: string): PaymentMethod => {
  return {
    supportedMethods: PaymentMethodIdentifiers.GOOGLE_PAY,
    data: {
      environment: "PRODUCTION",
      apiVersion: 2,
      apiVersionMinor: 0,
      merchantInfo: {
        merchantId: merchantId,
        merchantName: merchantName,
      },
      allowedPaymentMethods: [
        {
          type: "CARD",
          parameters: {
            allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            allowedCardNetworks: ["AMEX", "DISCOVER", "MASTERCARD", "VISA"],
          },
          tokenizationSpecification: {
            type: "PAYMENT_GATEWAY",
            parameters: {
              gateway: gatewayId,
              gatewayMerchantId: merchantId,
            },
          },
        },
      ],
    },
  };
};

/**
 * 创建Apple Pay支付方式
 * @param merchantId 商户ID
 * @param merchantName 商户名称
 * @returns 支付方式对象
 */
export const createApplePayment = (merchantId: string, merchantName: string): PaymentMethod => {
  return {
    supportedMethods: PaymentMethodIdentifiers.APPLE_PAY,
    data: {
      version: 3,
      merchantIdentifier: merchantId,
      merchantCapabilities: ["supports3DS", "supportsDebit", "supportsCredit"],
      supportedNetworks: ["amex", "discover", "masterCard", "visa"],
      countryCode: "US",
    },
  };
};

/**
 * 格式化金额
 * @param amount 金额
 * @param currency 货币代码
 * @returns 格式化的金额字符串
 */
export const formatAmount = (amount: number, currency: string = "CNY"): string => {
  return amount.toFixed(2);
};

/**
 * 创建支付详情对象
 * @param totalAmount 总金额
 * @param totalLabel 总金额标签
 * @param currency 货币代码
 * @param items 支付项目
 * @returns 支付详情对象
 */
export const createPaymentDetails = (
  totalAmount: number,
  totalLabel: string = "总金额",
  currency: string = "CNY",
  items?: Array<{ label: string; amount: number }>,
): PaymentDetails => {
  const formattedTotal = formatAmount(totalAmount, currency);

  const details: PaymentDetails = {
    total: {
      label: totalLabel,
      amount: {
        currency,
        value: formattedTotal,
      },
    },
  };

  if (items && items.length > 0) {
    details.displayItems = items.map(item => ({
      label: item.label,
      amount: {
        currency,
        value: formatAmount(item.amount, currency),
      },
    }));
  }

  return details;
};

/**
 * 创建支付请求
 * @param methods 支付方式列表
 * @param details 支付详情
 * @param options 支付选项
 * @returns 支付请求对象
 */
export const createPaymentRequest = (
  methods: PaymentMethod[],
  details: PaymentDetails,
  options?: PaymentOptions,
): PaymentRequest => {
  if (!isPaymentSupported()) {
    throw new Error("您的浏览器不支持Payment Request API");
  }

  return new PaymentRequest(methods, details, options);
};

/**
 * 发起支付流程
 * @param request 支付请求对象
 * @returns Promise，解析为支付响应
 */
export const requestPayment = async (request: PaymentRequest): Promise<CustomPaymentResponse> => {
  try {
    // 检查是否可以发起支付
    const canMakePayment = await request.canMakePayment();
    if (!canMakePayment) {
      throw new Error("当前环境无法完成支付，请检查支付方式是否可用");
    }

    // 发起支付
    return await request.show();
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new Error("用户取消了支付");
    }
    throw error;
  }
};

/**
 * 便捷支付函数
 * @param methods 支付方式列表
 * @param amount 总金额
 * @param label 总金额标签
 * @param currency 货币代码
 * @param options 支付选项
 * @returns Promise，解析为支付响应
 */
export const makePayment = async (
  methods: PaymentMethod[],
  amount: number,
  label: string = "总金额",
  currency: string = "CNY",
  options?: PaymentOptions,
): Promise<CustomPaymentResponse> => {
  // 创建支付详情
  const details = createPaymentDetails(amount, label, currency);

  // 创建支付请求
  const request = createPaymentRequest(methods, details, options);

  // 发起支付
  return requestPayment(request);
};

/**
 * 处理支付响应
 * @param response 支付响应
 * @param onSuccess 支付成功回调
 * @param onFailure 支付失败回调
 */
export const processPaymentResponse = async (
  response: CustomPaymentResponse,
  onSuccess: (response: CustomPaymentResponse) => Promise<void>,
  onFailure: (error: Error) => void,
): Promise<void> => {
  try {
    // 调用成功回调，处理支付结果
    await onSuccess(response);

    // 完成支付
    await response.complete("success");
  } catch (error) {
    // 处理错误
    onFailure(error as Error);

    // 尝试重试支付
    if (response.retry) {
      try {
        await response.retry();
      } catch (retryError) {
        // 重试失败，标记支付失败
        await response.complete("fail");
      }
    } else {
      // 不支持重试，直接标记支付失败
      await response.complete("fail");
    }
  }
};

// 同时提供命名空间对象
export const paymentUtils = {
  isPaymentSupported,
  isPaymentMethodSupported,
  PaymentMethodIdentifiers,
  createBasicCardPayment,
  createGooglePayment,
  createApplePayment,
  formatAmount,
  createPaymentDetails,
  createPaymentRequest,
  requestPayment,
  makePayment,
  processPaymentResponse,
};

// 默认导出命名空间对象
export default paymentUtils;
