/**
 * 情感分析工具
 * 提供文本情感分析与情绪识别功能
 */

/**
 * 词语情感权重定义
 */
export interface SentimentWord {
  /**
   * 词语
   */
  word: string;

  /**
   * 情感得分 (-5 到 5)
   * 负值表示负面情绪，正值表示正面情绪
   */
  score: number;

  /**
   * 情感类别
   */
  category?: "joy" | "anger" | "fear" | "sadness" | "surprise" | "disgust" | "trust" | "anticipation" | string;
}

/**
 * 情感分析结果
 */
export interface SentimentResult {
  /**
   * 总体情感得分 (-1 到 1)
   */
  score: number;

  /**
   * 情感倾向 (positive, negative, neutral)
   */
  polarity: "positive" | "negative" | "neutral";

  /**
   * 正面情感强度 (0-1)
   */
  positive: number;

  /**
   * 负面情感强度 (0-1)
   */
  negative: number;

  /**
   * 情感类别分布
   */
  categories?: Record<string, number>;

  /**
   * 情感词匹配详情
   */
  matches?: Array<{
    word: string;
    score: number;
    position: number;
  }>;
}

/**
 * 情感分析器参数
 */
export interface SentimentAnalyzerOptions {
  /**
   * 情感词典
   */
  lexicon?: SentimentWord[];

  /**
   * 增强词列表（如"非常"，"十分"等）及其强度
   */
  intensifiers?: Record<string, number>;

  /**
   * 否定词列表
   */
  negators?: string[];

  /**
   * 是否保留匹配详情
   */
  keepMatches?: boolean;

  /**
   * 是否启用情感类别分析
   */
  enableCategories?: boolean;

  /**
   * 分词器函数
   */
  tokenizer?: (text: string) => string[];

  /**
   * 是否区分大小写
   */
  caseSensitive?: boolean;
}

/**
 * 情感分析器
 */
export class SentimentAnalyzer {
  private lexicon: Map<string, SentimentWord> = new Map();
  private intensifiers: Map<string, number> = new Map();
  private negators: Set<string> = new Set();
  private options: Required<SentimentAnalyzerOptions>;

  /**
   * 创建情感分析器实例
   * @param options 配置选项
   */
  constructor(options: SentimentAnalyzerOptions = {}) {
    // 设置默认选项
    this.options = {
      lexicon: options.lexicon || [],
      intensifiers: options.intensifiers || {
        非常: 2,
        特别: 2,
        十分: 1.8,
        很: 1.5,
        相当: 1.5,
        比较: 1.2,
        稍微: 0.5,
        有点: 0.3,
      },
      negators: options.negators || ["不", "没", "无", "非", "莫", "勿", "别", "毙"],
      keepMatches: options.keepMatches ?? false,
      enableCategories: options.enableCategories ?? false,
      tokenizer:
        options.tokenizer ||
        ((text: string) => {
          // 简单的中文分词，实际应用中应使用专业分词库
          return text
            .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, " ")
            .split(/\s+/)
            .filter(Boolean);
        }),
      caseSensitive: options.caseSensitive ?? false,
    };

    // 初始化词典
    for (const word of this.options.lexicon) {
      this.addWord(word);
    }

    // 初始化强度词
    for (const [word, score] of Object.entries(this.options.intensifiers)) {
      this.intensifiers.set(this.normalizeWord(word), score);
    }

    // 初始化否定词
    for (const word of this.options.negators) {
      this.negators.add(this.normalizeWord(word));
    }
  }

  /**
   * 向词典添加情感词
   * @param word 情感词定义
   */
  addWord(word: SentimentWord): void {
    this.lexicon.set(this.normalizeWord(word.word), word);
  }

  /**
   * 批量添加情感词
   * @param words 情感词列表
   */
  addWords(words: SentimentWord[]): void {
    for (const word of words) {
      this.addWord(word);
    }
  }

  /**
   * 分析文本情感
   * @param text 待分析文本
   * @returns 情感分析结果
   */
  analyze(text: string): SentimentResult {
    const tokens = this.options.tokenizer(text);
    const matches: SentimentResult["matches"] = [];
    let totalScore = 0;
    let positiveScore = 0;
    let negativeScore = 0;
    const categories: Record<string, number> = {};

    // 处理每个词
    for (let i = 0; i < tokens.length; i++) {
      const token = this.normalizeWord(tokens[i]);
      const sentimentWord = this.lexicon.get(token);

      if (sentimentWord) {
        // 计算修饰语对情感强度的影响
        let multiplier = 1;
        let j = i - 1;

        // 查找前面的强度词和否定词
        while (j >= 0 && j >= i - 3) {
          const prevToken = this.normalizeWord(tokens[j]);

          // 处理否定词
          if (this.negators.has(prevToken)) {
            multiplier *= -0.7; // 否定通常会减弱并转向情感，而不是完全反转
            j--;
            continue;
          }

          // 处理强度词
          const intensifier = this.intensifiers.get(prevToken);
          if (intensifier) {
            multiplier *= intensifier;
            j--;
            continue;
          }

          break;
        }

        // 计算最终得分
        const finalScore = sentimentWord.score * multiplier;
        totalScore += finalScore;

        // 更新正负面得分
        if (finalScore > 0) {
          positiveScore += finalScore;
        } else if (finalScore < 0) {
          negativeScore -= finalScore; // 转为正值
        }

        // 更新情感类别
        if (this.options.enableCategories && sentimentWord.category) {
          categories[sentimentWord.category] = (categories[sentimentWord.category] || 0) + Math.abs(finalScore);
        }

        // 记录匹配详情
        if (this.options.keepMatches) {
          matches.push({
            word: tokens[i],
            score: finalScore,
            position: i,
          });
        }
      }
    }

    // 如果没有找到情感词，返回中性结果
    if (positiveScore === 0 && negativeScore === 0) {
      return {
        score: 0,
        polarity: "neutral",
        positive: 0,
        negative: 0,
        ...(this.options.enableCategories ? { categories: {} } : {}),
        ...(this.options.keepMatches ? { matches: [] } : {}),
      };
    }

    // 标准化得分到 -1 到 1 之间
    const totalSentiment = positiveScore + negativeScore;
    const normalizedScore = totalScore / totalSentiment;

    // 确定情感倾向
    let polarity: "positive" | "negative" | "neutral";
    if (normalizedScore > 0.05) {
      polarity = "positive";
    } else if (normalizedScore < -0.05) {
      polarity = "negative";
    } else {
      polarity = "neutral";
    }

    // 归一化情感类别分布
    if (this.options.enableCategories) {
      const totalCategoryScore = Object.values(categories).reduce((sum, score) => sum + score, 0);
      if (totalCategoryScore > 0) {
        for (const category in categories) {
          categories[category] /= totalCategoryScore;
        }
      }
    }

    // 构建结果
    return {
      score: normalizedScore,
      polarity,
      positive: positiveScore / totalSentiment,
      negative: negativeScore / totalSentiment,
      ...(this.options.enableCategories ? { categories } : {}),
      ...(this.options.keepMatches ? { matches } : {}),
    };
  }

  /**
   * 标准化单词
   */
  private normalizeWord(word: string): string {
    if (!this.options.caseSensitive) {
      return word.toLowerCase();
    }
    return word;
  }

  /**
   * 加载预设词典
   * @param name 预设名称
   */
  async loadPreset(name: "chinese-basic" | "english-basic"): Promise<void> {
    let lexiconData: SentimentWord[] = [];

    // 在实际应用中，应该从外部资源加载词典
    if (name === "chinese-basic") {
      lexiconData = [
        { word: "喜欢", score: 3, category: "joy" },
        { word: "爱", score: 4, category: "joy" },
        { word: "高兴", score: 3, category: "joy" },
        { word: "开心", score: 3, category: "joy" },
        { word: "快乐", score: 3, category: "joy" },
        { word: "兴奋", score: 4, category: "joy" },
        { word: "满意", score: 2, category: "joy" },

        { word: "愤怒", score: -4, category: "anger" },
        { word: "生气", score: -3, category: "anger" },
        { word: "烦躁", score: -2, category: "anger" },
        { word: "恼火", score: -3, category: "anger" },

        { word: "悲伤", score: -3, category: "sadness" },
        { word: "难过", score: -3, category: "sadness" },
        { word: "痛苦", score: -4, category: "sadness" },
        { word: "伤心", score: -3, category: "sadness" },

        { word: "恐惧", score: -3, category: "fear" },
        { word: "害怕", score: -3, category: "fear" },
        { word: "担忧", score: -2, category: "fear" },
        { word: "紧张", score: -2, category: "fear" },

        { word: "惊讶", score: 1, category: "surprise" },
        { word: "震惊", score: -1, category: "surprise" },

        { word: "厌恶", score: -3, category: "disgust" },
        { word: "讨厌", score: -3, category: "disgust" },

        { word: "好", score: 2 },
        { word: "坏", score: -2 },
        { word: "优秀", score: 3 },
        { word: "糟糕", score: -3 },
        { word: "出色", score: 3 },
        { word: "差劲", score: -3 },
        { word: "美好", score: 3 },
        { word: "可怕", score: -3 },
        { word: "清晰", score: 1 },
        { word: "模糊", score: -1 },
        { word: "容易", score: 2 },
        { word: "困难", score: -2 },
        { word: "简单", score: 2 },
        { word: "复杂", score: -1 },
        { word: "强大", score: 2 },
        { word: "弱小", score: -2 },
        { word: "成功", score: 3 },
        { word: "失败", score: -3 },
        { word: "胜利", score: 3 },
        { word: "失败", score: -3 },
        // 实际应用中这个列表应该包含数千个词
      ];
    } else if (name === "english-basic") {
      lexiconData = [
        { word: "happy", score: 3, category: "joy" },
        { word: "sad", score: -3, category: "sadness" },
        { word: "angry", score: -3, category: "anger" },
        // 实际应用中应有更多词
      ];
    }

    this.addWords(lexiconData);
  }
}

/**
 * 创建默认情感分析器
 */
export function createSentimentAnalyzer(options?: SentimentAnalyzerOptions): SentimentAnalyzer {
  return new SentimentAnalyzer(options);
}

/**
 * 简单情感分析
 * @param text 待分析文本
 * @returns 情感得分 (-1 到 1)
 */
export function analyzeSentiment(text: string): number {
  const analyzer = new SentimentAnalyzer();
  return analyzer.analyze(text).score;
}

/**
 * 检测文本情感倾向
 * @param text 待分析文本
 * @returns 情感倾向 (positive, negative, neutral)
 */
export function detectSentimentPolarity(text: string): "positive" | "negative" | "neutral" {
  const analyzer = new SentimentAnalyzer();
  return analyzer.analyze(text).polarity;
}

// 同时提供命名空间对象
export const sentiment = {
  SentimentAnalyzer,
  createSentimentAnalyzer,
  analyzeSentiment,
  detectSentimentPolarity,
};

// 默认导出命名空间对象
export default sentiment;
