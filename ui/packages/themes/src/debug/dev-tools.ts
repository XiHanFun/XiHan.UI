/**
 * 开发者工具
 * 提供浏览器开发者工具集成、可视化界面、快捷操作等功能
 */

import { StyleDebugger } from "./debugger";
import { StyleAnalyzer } from "./analyzer";
import { StyleMonitor } from "./monitor";
import type { MonitorEvent } from "./monitor";
import type { StyleInspectionResult, PerformanceReport, ComplexityReport, StyleUsageStats } from "./types";

/**
 * 开发者工具配置
 */
export interface DevToolsConfig {
  enabled: boolean;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  theme: "light" | "dark" | "auto";
  autoOpen: boolean;
  hotkey: string;
  showInProduction: boolean;
}

/**
 * 开发者工具类
 */
export class DevTools {
  private debugger: StyleDebugger;
  private analyzer: StyleAnalyzer;
  private monitor: StyleMonitor;
  private config: DevToolsConfig;
  private isOpen = false;
  private panel?: HTMLElement;
  private selectedElement?: HTMLElement;

  constructor(config: Partial<DevToolsConfig> = {}) {
    this.config = {
      enabled: true,
      position: "bottom-right",
      theme: "auto",
      autoOpen: false,
      hotkey: "Ctrl+Shift+D",
      showInProduction: false,
      ...config,
    };

    this.debugger = new StyleDebugger();
    this.analyzer = new StyleAnalyzer();
    this.monitor = new StyleMonitor();

    this.init();
  }

  /**
   * 初始化开发者工具
   */
  private init(): void {
    if (!this.config.enabled) return;

    // 检查生产环境
    if (!this.config.showInProduction && process.env.NODE_ENV === "production") {
      return;
    }

    this.setupHotkey();
    this.setupMonitorEvents();
    this.injectStyles();

    if (this.config.autoOpen) {
      this.open();
    }

    // 添加到全局对象，方便调试
    (window as any).__xihanUIDevTools = this;
  }

  /**
   * 打开开发者工具
   */
  open(): void {
    if (this.isOpen || !this.config.enabled) return;

    this.createPanel();
    this.isOpen = true;
    this.monitor.start();
  }

  /**
   * 关闭开发者工具
   */
  close(): void {
    if (!this.isOpen) return;

    this.removePanel();
    this.isOpen = false;
    this.monitor.stop();
  }

  /**
   * 切换开发者工具显示状态
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * 检查指定元素
   */
  inspectElement(element: HTMLElement): StyleInspectionResult {
    this.selectedElement = element;
    const result = this.debugger.inspect(element);

    if (this.isOpen) {
      this.updateInspectionPanel(result);
    }

    return result;
  }

  /**
   * 分析当前页面样式
   */
  analyzeCurrentPage(): {
    usage: StyleUsageStats;
    complexity: ComplexityReport;
    performance: PerformanceReport;
  } {
    const usage = this.analyzer.getUsageStats();
    const complexity = this.analyzer.analyzeComplexity();
    const performance = this.monitor.getRealtimePerformance();

    if (this.isOpen) {
      this.updateAnalysisPanel({ usage, complexity, performance });
    }

    return { usage, complexity, performance };
  }

  /**
   * 导出调试报告
   */
  exportReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      analysis: this.analyzeCurrentPage(),
      snapshots: this.monitor.getSnapshots(),
      memoryTrend: this.monitor.getMemoryTrend(),
      performanceTrend: this.monitor.getPerformanceTrend(),
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<DevToolsConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.isOpen) {
      this.updatePanelPosition();
      this.updatePanelTheme();
    }
  }

  // 私有方法

  private setupHotkey(): void {
    document.addEventListener("keydown", event => {
      if (this.matchesHotkey(event, this.config.hotkey)) {
        event.preventDefault();
        this.toggle();
      }
    });
  }

  private matchesHotkey(event: KeyboardEvent, hotkey: string): boolean {
    const parts = hotkey.toLowerCase().split("+");
    const key = parts.pop();

    const modifiers = {
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey,
    };

    // 检查修饰键
    for (const part of parts) {
      if (!(modifiers as any)[part]) {
        return false;
      }
    }

    // 检查主键
    return event.key.toLowerCase() === key;
  }

  private setupMonitorEvents(): void {
    this.monitor.on("performance-warning", (event: MonitorEvent) => {
      this.showNotification("性能警告", event.data, "warning");
    });

    this.monitor.on("memory-warning", (event: MonitorEvent) => {
      this.showNotification("内存警告", event.data, "warning");
    });

    this.monitor.on("style-injected", (event: MonitorEvent) => {
      if (this.isOpen) {
        this.updateActivityLog("样式注入", event.data);
      }
    });

    this.monitor.on("style-removed", (event: MonitorEvent) => {
      if (this.isOpen) {
        this.updateActivityLog("样式移除", event.data);
      }
    });
  }

  private injectStyles(): void {
    const styles = `
      .xihan-devtools {
        position: fixed;
        z-index: 999999;
        width: 400px;
        height: 600px;
        background: var(--devtools-bg, #ffffff);
        border: 1px solid var(--devtools-border, #e0e0e0);
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        color: var(--devtools-text, #333333);
        overflow: hidden;
        resize: both;
        min-width: 300px;
        min-height: 400px;
      }

      .xihan-devtools[data-theme="dark"] {
        --devtools-bg: #1e1e1e;
        --devtools-border: #404040;
        --devtools-text: #ffffff;
        --devtools-panel-bg: #252526;
        --devtools-tab-active: #007acc;
        --devtools-tab-hover: #2d2d30;
      }

      .xihan-devtools[data-theme="light"] {
        --devtools-bg: #ffffff;
        --devtools-border: #e0e0e0;
        --devtools-text: #333333;
        --devtools-panel-bg: #f8f8f8;
        --devtools-tab-active: #007acc;
        --devtools-tab-hover: #f0f0f0;
      }

      .xihan-devtools-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: var(--devtools-panel-bg, #f8f8f8);
        border-bottom: 1px solid var(--devtools-border, #e0e0e0);
      }

      .xihan-devtools-title {
        font-weight: 600;
        font-size: 14px;
      }

      .xihan-devtools-close {
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        color: var(--devtools-text, #333333);
        padding: 4px;
        border-radius: 4px;
      }

      .xihan-devtools-close:hover {
        background: var(--devtools-tab-hover, #f0f0f0);
      }

      .xihan-devtools-tabs {
        display: flex;
        background: var(--devtools-panel-bg, #f8f8f8);
        border-bottom: 1px solid var(--devtools-border, #e0e0e0);
      }

      .xihan-devtools-tab {
        padding: 8px 16px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--devtools-text, #333333);
        border-bottom: 2px solid transparent;
        transition: all 0.2s;
      }

      .xihan-devtools-tab:hover {
        background: var(--devtools-tab-hover, #f0f0f0);
      }

      .xihan-devtools-tab.active {
        border-bottom-color: var(--devtools-tab-active, #007acc);
        color: var(--devtools-tab-active, #007acc);
      }

      .xihan-devtools-content {
        height: calc(100% - 80px);
        overflow-y: auto;
        padding: 12px;
      }

      .xihan-devtools-section {
        margin-bottom: 16px;
      }

      .xihan-devtools-section-title {
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--devtools-tab-active, #007acc);
      }

      .xihan-devtools-property {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        border-bottom: 1px solid var(--devtools-border, #e0e0e0);
      }

      .xihan-devtools-property:last-child {
        border-bottom: none;
      }

      .xihan-devtools-key {
        font-weight: 500;
        color: var(--devtools-text, #333333);
      }

      .xihan-devtools-value {
        color: #666;
        font-family: monospace;
      }

      .xihan-devtools-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000000;
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        padding: 12px 16px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
      }

      .xihan-devtools-notification.warning {
        border-left: 4px solid #ff9800;
      }

      .xihan-devtools-notification.error {
        border-left: 4px solid #f44336;
      }

      .xihan-devtools-notification.info {
        border-left: 4px solid #2196f3;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .xihan-devtools-position-top-left {
        top: 20px;
        left: 20px;
      }

      .xihan-devtools-position-top-right {
        top: 20px;
        right: 20px;
      }

      .xihan-devtools-position-bottom-left {
        bottom: 20px;
        left: 20px;
      }

      .xihan-devtools-position-bottom-right {
        bottom: 20px;
        right: 20px;
      }
    `;

    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    styleElement.setAttribute("data-xihan-devtools", "true");
    document.head.appendChild(styleElement);
  }

  private createPanel(): void {
    this.panel = document.createElement("div");
    this.panel.className = `xihan-devtools xihan-devtools-position-${this.config.position}`;
    this.panel.setAttribute("data-theme", this.getTheme());

    this.panel.innerHTML = `
      <div class="xihan-devtools-header">
        <div class="xihan-devtools-title">XiHan UI 样式调试工具</div>
        <button class="xihan-devtools-close">×</button>
      </div>
      <div class="xihan-devtools-tabs">
        <button class="xihan-devtools-tab active" data-tab="inspector">检查器</button>
        <button class="xihan-devtools-tab" data-tab="analyzer">分析器</button>
        <button class="xihan-devtools-tab" data-tab="monitor">监控器</button>
        <button class="xihan-devtools-tab" data-tab="settings">设置</button>
      </div>
      <div class="xihan-devtools-content">
        <div id="inspector-panel">
          <div class="xihan-devtools-section">
            <div class="xihan-devtools-section-title">选择元素进行检查</div>
            <p>点击页面上的元素或使用 inspectElement() 方法</p>
          </div>
        </div>
      </div>
    `;

    // 绑定事件
    this.bindPanelEvents();

    document.body.appendChild(this.panel);
  }

  private removePanel(): void {
    if (this.panel) {
      this.panel.remove();
      this.panel = undefined;
    }
  }

  private bindPanelEvents(): void {
    if (!this.panel) return;

    // 关闭按钮
    const closeBtn = this.panel.querySelector(".xihan-devtools-close");
    closeBtn?.addEventListener("click", () => this.close());

    // 标签切换
    const tabs = this.panel.querySelectorAll(".xihan-devtools-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", e => {
        const target = e.target as HTMLElement;
        const tabName = target.getAttribute("data-tab");
        this.switchTab(tabName!);
      });
    });

    // 元素选择
    document.addEventListener("click", e => {
      if (e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        this.inspectElement(e.target as HTMLElement);
      }
    });
  }

  private switchTab(tabName: string): void {
    if (!this.panel) return;

    // 更新标签状态
    const tabs = this.panel.querySelectorAll(".xihan-devtools-tab");
    tabs.forEach(tab => {
      tab.classList.toggle("active", tab.getAttribute("data-tab") === tabName);
    });

    // 更新内容
    const content = this.panel.querySelector(".xihan-devtools-content");
    if (content) {
      switch (tabName) {
        case "inspector":
          content.innerHTML = this.getInspectorContent();
          break;
        case "analyzer":
          content.innerHTML = this.getAnalyzerContent();
          break;
        case "monitor":
          content.innerHTML = this.getMonitorContent();
          break;
        case "settings":
          content.innerHTML = this.getSettingsContent();
          break;
      }
    }
  }

  private getInspectorContent(): string {
    if (!this.selectedElement) {
      return `
        <div class="xihan-devtools-section">
          <div class="xihan-devtools-section-title">选择元素进行检查</div>
          <p>按住 Ctrl+Shift 并点击页面元素</p>
        </div>
      `;
    }

    const result = this.debugger.inspect(this.selectedElement);
    return `
      <div class="xihan-devtools-section">
        <div class="xihan-devtools-section-title">元素信息</div>
        <div class="xihan-devtools-property">
          <span class="xihan-devtools-key">标签</span>
          <span class="xihan-devtools-value">${result.element.tagName.toLowerCase()}</span>
        </div>
        <div class="xihan-devtools-property">
          <span class="xihan-devtools-key">类名</span>
          <span class="xihan-devtools-value">${result.element.className}</span>
        </div>
        <div class="xihan-devtools-property">
          <span class="xihan-devtools-key">特异性</span>
          <span class="xihan-devtools-value">${result.specificity.total}</span>
        </div>
      </div>
      <div class="xihan-devtools-section">
        <div class="xihan-devtools-section-title">样式冲突 (${result.conflicts.length})</div>
        ${result.conflicts
          .map(
            conflict => `
          <div class="xihan-devtools-property">
            <span class="xihan-devtools-key">${conflict.property}</span>
            <span class="xihan-devtools-value">${conflict.severity}</span>
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  }

  private getAnalyzerContent(): string {
    const analysis = this.analyzeCurrentPage();
    return `
      <div class="xihan-devtools-section">
        <div class="xihan-devtools-section-title">使用统计</div>
        <div class="xihan-devtools-property">
          <span class="xihan-devtools-key">总规则数</span>
          <span class="xihan-devtools-value">${analysis.usage.totalRules}</span>
        </div>
        <div class="xihan-devtools-property">
          <span class="xihan-devtools-key">已使用</span>
          <span class="xihan-devtools-value">${analysis.usage.usedRules}</span>
        </div>
        <div class="xihan-devtools-property">
          <span class="xihan-devtools-key">未使用</span>
          <span class="xihan-devtools-value">${analysis.usage.totalRules - analysis.usage.usedRules}</span>
        </div>
      </div>
      <div class="xihan-devtools-section">
        <div class="xihan-devtools-section-title">复杂度分析</div>
        <div class="xihan-devtools-property">
          <span class="xihan-devtools-key">复杂度评分</span>
          <span class="xihan-devtools-value">${analysis.complexity.score}</span>
        </div>
        <div class="xihan-devtools-property">
          <span class="xihan-devtools-key">建议数量</span>
          <span class="xihan-devtools-value">${analysis.complexity.suggestions.length}</span>
        </div>
      </div>
    `;
  }

  private getMonitorContent(): string {
    const performance = this.monitor.getRealtimePerformance();
    const memoryTrend = this.monitor.getMemoryTrend();
    const currentMemory = memoryTrend[memoryTrend.length - 1];

    return `
      <div class="xihan-devtools-section">
        <div class="xihan-devtools-section-title">实时性能</div>
        <div class="xihan-devtools-property">
          <span class="xihan-devtools-key">编译时间</span>
          <span class="xihan-devtools-value">${performance.compilationTime.toFixed(2)}ms</span>
        </div>
        <div class="xihan-devtools-property">
          <span class="xihan-devtools-key">注入时间</span>
          <span class="xihan-devtools-value">${performance.injectionTime.toFixed(2)}ms</span>
        </div>
        <div class="xihan-devtools-property">
          <span class="xihan-devtools-key">缓存命中率</span>
          <span class="xihan-devtools-value">${(performance.cacheHitRate * 100).toFixed(1)}%</span>
        </div>
      </div>
      <div class="xihan-devtools-section">
        <div class="xihan-devtools-section-title">内存使用</div>
        <div class="xihan-devtools-property">
          <span class="xihan-devtools-key">总大小</span>
          <span class="xihan-devtools-value">${this.formatBytes(currentMemory?.totalSize || 0)}</span>
        </div>
        <div class="xihan-devtools-property">
          <span class="xihan-devtools-key">注入样式</span>
          <span class="xihan-devtools-value">${currentMemory?.injectedStyles || 0}</span>
        </div>
      </div>
    `;
  }

  private getSettingsContent(): string {
    return `
      <div class="xihan-devtools-section">
        <div class="xihan-devtools-section-title">配置选项</div>
        <div class="xihan-devtools-property">
          <span class="xihan-devtools-key">主题</span>
          <span class="xihan-devtools-value">${this.config.theme}</span>
        </div>
        <div class="xihan-devtools-property">
          <span class="xihan-devtools-key">位置</span>
          <span class="xihan-devtools-value">${this.config.position}</span>
        </div>
        <div class="xihan-devtools-property">
          <span class="xihan-devtools-key">快捷键</span>
          <span class="xihan-devtools-value">${this.config.hotkey}</span>
        </div>
      </div>
      <div class="xihan-devtools-section">
        <div class="xihan-devtools-section-title">操作</div>
        <button onclick="window.__xihanUIDevTools.exportReport()">导出报告</button>
        <button onclick="window.__xihanUIDevTools.analyzer.clearCache()">清除缓存</button>
      </div>
    `;
  }

  private updateInspectionPanel(result: StyleInspectionResult): void {
    // 更新检查器面板内容
    if (this.panel) {
      const content = this.panel.querySelector(".xihan-devtools-content");
      if (content) {
        content.innerHTML = this.getInspectorContent();
      }
    }
  }

  private updateAnalysisPanel(analysis: any): void {
    // 更新分析器面板内容
    if (this.panel) {
      const content = this.panel.querySelector(".xihan-devtools-content");
      if (content) {
        content.innerHTML = this.getAnalyzerContent();
      }
    }
  }

  private updateActivityLog(action: string, data: any): void {
    // 更新活动日志
    console.log(`[DevTools] ${action}:`, data);
  }

  private updatePanelPosition(): void {
    if (this.panel) {
      this.panel.className = `xihan-devtools xihan-devtools-position-${this.config.position}`;
    }
  }

  private updatePanelTheme(): void {
    if (this.panel) {
      this.panel.setAttribute("data-theme", this.getTheme());
    }
  }

  private getTheme(): string {
    if (this.config.theme === "auto") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return this.config.theme;
  }

  private showNotification(title: string, data: any, type: "info" | "warning" | "error" = "info"): void {
    const notification = document.createElement("div");
    notification.className = `xihan-devtools-notification ${type}`;
    notification.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
      <div style="font-size: 11px; color: #666;">${JSON.stringify(data, null, 2)}</div>
    `;

    document.body.appendChild(notification);

    // 自动移除
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

/**
 * 全局开发者工具实例
 */
export const devTools = new DevTools();

/**
 * 创建开发者工具实例
 */
export function createDevTools(config?: Partial<DevToolsConfig>): DevTools {
  return new DevTools(config);
}
