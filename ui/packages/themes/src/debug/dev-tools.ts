/**
 * 开发工具
 * 提供开发时的调试和检查工具
 */

import { styleAnalyzer } from "./analyzer";
import { profiler } from "./profiler";
import { logger } from "./logger";

// =============================================
// 开发工具类
// =============================================

export class DevTools {
  private isEnabled: boolean = false;
  private panel: HTMLElement | null = null;

  constructor() {
    this.setupDevTools();
  }

  /**
   * 启用开发工具
   */
  enable(): void {
    if (this.isEnabled) return;

    this.isEnabled = true;
    this.createPanel();
    this.attachToWindow();
    logger.info("开发工具已启用");
  }

  /**
   * 禁用开发工具
   */
  disable(): void {
    if (!this.isEnabled) return;

    this.isEnabled = false;
    this.removePanel();
    this.detachFromWindow();
    logger.info("开发工具已禁用");
  }

  /**
   * 创建调试面板
   */
  private createPanel(): void {
    if (typeof document === "undefined") return;

    this.panel = document.createElement("div");
    this.panel.id = "xihan-ui-dev-tools";
    this.panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 400px;
      background: #1a1a1a;
      color: #fff;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 16px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      z-index: 10000;
      overflow-y: auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    this.updatePanelContent();
    document.body.appendChild(this.panel);
  }

  /**
   * 移除调试面板
   */
  private removePanel(): void {
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
      this.panel = null;
    }
  }

  /**
   * 更新面板内容
   */
  private updatePanelContent(): void {
    if (!this.panel) return;

    const styleStats = styleAnalyzer.getStyleStats();
    const memoryUsage = this.getMemoryInfo();
    const performanceReport = profiler.generateReport();

    this.panel.innerHTML = `
      <div style="margin-bottom: 16px;">
        <h3 style="margin: 0 0 8px 0; color: #4CAF50;">XiHan UI 开发工具</h3>
        <button onclick="window.__xihanDevTools.toggle()" style="
          background: #333;
          color: #fff;
          border: 1px solid #555;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
        ">关闭</button>
      </div>

      <div style="margin-bottom: 12px;">
        <h4 style="margin: 0 0 4px 0; color: #2196F3;">样式统计</h4>
        <div>总规则: ${styleStats.totalRules}</div>
        <div>未使用: ${styleStats.unusedRules}</div>
        <div>重复: ${styleStats.duplicateRules}</div>
      </div>

      <div style="margin-bottom: 12px;">
        <h4 style="margin: 0 0 4px 0; color: #FF9800;">内存使用</h4>
        ${
          memoryUsage
            ? `
          <div>已用: ${this.formatBytes(memoryUsage.usedJSHeapSize)}</div>
          <div>总计: ${this.formatBytes(memoryUsage.totalJSHeapSize)}</div>
          <div>限制: ${this.formatBytes(memoryUsage.jsHeapSizeLimit)}</div>
        `
            : "<div>不支持内存监控</div>"
        }
      </div>

      <div style="margin-bottom: 12px;">
        <h4 style="margin: 0 0 4px 0; color: #9C27B0;">性能分析</h4>
        <div>总分析: ${performanceReport.totalProfiles}</div>
        <div>平均耗时: ${performanceReport.averageDuration.toFixed(2)}ms</div>
        <div>最慢: ${performanceReport.slowestProfile} (${performanceReport.slowestDuration.toFixed(2)}ms)</div>
      </div>

      <div>
        <h4 style="margin: 0 0 4px 0; color: #F44336;">操作</h4>
        <button onclick="window.__xihanDevTools.analyzeStyles()" style="
          background: #333;
          color: #fff;
          border: 1px solid #555;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          margin-right: 4px;
        ">分析样式</button>
        <button onclick="window.__xihanDevTools.clearLogs()" style="
          background: #333;
          color: #fff;
          border: 1px solid #555;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
        ">清除日志</button>
      </div>
    `;
  }

  /**
   * 格式化字节数
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * 获取内存信息
   */
  private getMemoryInfo(): any {
    if ("memory" in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  /**
   * 分析样式
   */
  analyzeStyles(): void {
    const report = styleAnalyzer.generateReport();
    console.group("样式分析报告");
    console.log("统计信息:", report.stats);
    console.log("CSS 变量:", report.variables);
    console.log("建议:", report.recommendations);
    console.groupEnd();

    if (this.panel) {
      this.updatePanelContent();
    }
  }

  /**
   * 清除日志
   */
  clearLogs(): void {
    logger.clear();
    profiler.clear();
    console.clear();
    logger.info("日志已清除");
  }

  /**
   * 切换显示状态
   */
  toggle(): void {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  /**
   * 附加到 window 对象
   */
  private attachToWindow(): void {
    if (typeof window !== "undefined") {
      (window as any).__xihanDevTools = {
        toggle: () => this.toggle(),
        analyzeStyles: () => this.analyzeStyles(),
        clearLogs: () => this.clearLogs(),
        getStyleStats: () => styleAnalyzer.getStyleStats(),
        getPerformanceReport: () => profiler.generateReport(),
        getLogs: () => logger.getLogs(),
      };
    }
  }

  /**
   * 从 window 对象移除
   */
  private detachFromWindow(): void {
    if (typeof window !== "undefined") {
      delete (window as any).__xihanDevTools;
    }
  }

  /**
   * 设置开发工具
   */
  private setupDevTools(): void {
    // 检查是否在开发环境
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
      this.enable();
    }

    // 检查 URL 参数
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("devtools") === "true") {
        this.enable();
      }
    }

    // 监听键盘快捷键 (Ctrl+Shift+D)
    if (typeof document !== "undefined") {
      document.addEventListener("keydown", event => {
        if (event.ctrlKey && event.shiftKey && event.key === "D") {
          event.preventDefault();
          this.toggle();
        }
      });
    }
  }

  /**
   * 检查是否启用
   */
  get enabled(): boolean {
    return this.isEnabled;
  }
}

// =============================================
// 全局开发工具实例
// =============================================

export const devTools = new DevTools();

// 导出便捷函数
export const dev = {
  enable: () => devTools.enable(),
  disable: () => devTools.disable(),
  toggle: () => devTools.toggle(),
  analyzeStyles: () => devTools.analyzeStyles(),
  clearLogs: () => devTools.clearLogs(),
  get enabled() {
    return devTools.enabled;
  },
};
