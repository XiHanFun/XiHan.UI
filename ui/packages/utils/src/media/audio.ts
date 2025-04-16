/**
 * 音频处理工具
 * 提供Web Audio API的常用功能封装
 */

/**
 * 音频播放选项
 */
export interface AudioPlayOptions {
  /**
   * 音量 (0-1)
   */
  volume?: number;

  /**
   * 播放速率
   */
  playbackRate?: number;

  /**
   * 是否循环
   */
  loop?: boolean;

  /**
   * 自动播放
   */
  autoplay?: boolean;

  /**
   * 播放开始位置(秒)
   */
  startTime?: number;

  /**
   * 音频上下文
   */
  context?: AudioContext;
}

/**
 * 音频记录选项
 */
export interface AudioRecordOptions {
  /**
   * 音频格式
   */
  mimeType?: string;

  /**
   * 音频比特率
   */
  audioBitsPerSecond?: number;

  /**
   * 采样率
   */
  sampleRate?: number;

  /**
   * 声道数
   */
  channelCount?: number;
}

/**
 * 音频分析器选项
 */
export interface AudioAnalyzerOptions {
  /**
   * FFT大小，必须是2的幂
   */
  fftSize?: number;

  /**
   * 最小分贝值
   */
  minDecibels?: number;

  /**
   * 最大分贝值
   */
  maxDecibels?: number;

  /**
   * 平滑常数
   */
  smoothingTimeConstant?: number;
}

/**
 * 创建音频上下文
 */
export function createAudioContext(): AudioContext {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioContextClass();
}

/**
 * 检查浏览器是否支持Web Audio API
 */
export function isAudioSupported(): boolean {
  return !!(window.AudioContext || (window as any).webkitAudioContext);
}

/**
 * 检查浏览器是否支持音频录制
 */
export function isRecordingSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * 检查浏览器支持的音频格式
 */
export function getSupportedAudioFormats(): Record<string, boolean> {
  const audio = document.createElement("audio");

  return {
    mp3: !!audio.canPlayType("audio/mpeg;").replace(/^no$/, ""),
    wav: !!audio.canPlayType("audio/wav; codecs=1").replace(/^no$/, ""),
    ogg: !!audio.canPlayType("audio/ogg; codecs=vorbis").replace(/^no$/, ""),
    aac: !!audio.canPlayType("audio/aac;").replace(/^no$/, ""),
    m4a: !!audio.canPlayType("audio/x-m4a;").replace(/^no$/, ""),
    flac: !!audio.canPlayType("audio/flac;").replace(/^no$/, ""),
  };
}

/**
 * 加载音频文件
 * @param url 音频URL
 * @param context 音频上下文
 */
export async function loadAudio(url: string, context: AudioContext = createAudioContext()): Promise<AudioBuffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await context.decodeAudioData(arrayBuffer);
}

/**
 * 播放音频
 * @param source 音频源URL或AudioBuffer
 * @param options 播放选项
 * @returns 控制对象
 */
export async function playAudio(
  source: string | AudioBuffer,
  options: AudioPlayOptions = {},
): Promise<{
  play: () => void;
  pause: () => void;
  stop: () => void;
  setVolume: (value: number) => void;
  setPlaybackRate: (value: number) => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  onEnded: (callback: () => void) => void;
}> {
  const {
    volume = 1,
    playbackRate = 1,
    loop = false,
    autoplay = true,
    startTime = 0,
    context = createAudioContext(),
  } = options;

  // 创建音频节点
  const audioBuffer = typeof source === "string" ? await loadAudio(source, context) : source;

  // 音频源节点
  let sourceNode: AudioBufferSourceNode | null = null;
  let gainNode = context.createGain();
  let startedAt = 0;
  let pausedAt = 0;
  let isPlaying = false;
  let onEndedCallback: (() => void) | null = null;

  // 连接节点
  gainNode.connect(context.destination);
  gainNode.gain.value = volume;

  // 创建并配置源节点
  function setupSourceNode() {
    sourceNode = context.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.loop = loop;
    sourceNode.playbackRate.value = playbackRate;
    sourceNode.connect(gainNode);

    sourceNode.onended = () => {
      if (!loop) {
        isPlaying = false;
        if (onEndedCallback) {
          onEndedCallback();
        }
      }
    };
  }

  // 播放控制接口
  const controls = {
    play: () => {
      if (isPlaying) return;

      // 创建新的源节点
      setupSourceNode();

      if (sourceNode) {
        const offset = pausedAt > 0 ? pausedAt : startTime;
        sourceNode.start(0, offset);
        startedAt = context.currentTime - offset;
        pausedAt = 0;
        isPlaying = true;
      }
    },

    pause: () => {
      if (!isPlaying || !sourceNode) return;

      // 计算暂停位置
      pausedAt = context.currentTime - startedAt;
      controls.stop();
    },

    stop: () => {
      if (sourceNode) {
        sourceNode.stop();
        sourceNode.disconnect();
        sourceNode = null;
      }

      pausedAt = 0;
      isPlaying = false;
    },

    setVolume: (value: number) => {
      if (value >= 0 && value <= 1) {
        gainNode.gain.value = value;
      }
    },

    setPlaybackRate: (value: number) => {
      if (sourceNode && value > 0) {
        sourceNode.playbackRate.value = value;
      }
    },

    getDuration: () => audioBuffer.duration,

    getCurrentTime: () => {
      if (isPlaying) {
        return context.currentTime - startedAt;
      }
      return pausedAt;
    },

    onEnded: (callback: () => void) => {
      onEndedCallback = callback;
    },
  };

  // 自动播放
  if (autoplay) {
    controls.play();
  }

  return controls;
}

/**
 * 创建音频分析器
 * @param context 音频上下文
 * @param options 分析器选项
 */
export function createAudioAnalyzer(
  context: AudioContext = createAudioContext(),
  options: AudioAnalyzerOptions = {},
): {
  analyzer: AnalyserNode;
  getFrequencyData: () => Uint8Array;
  getTimeData: () => Uint8Array;
  connectSource: (source: AudioNode) => void;
} {
  const { fftSize = 2048, minDecibels = -90, maxDecibels = -10, smoothingTimeConstant = 0.85 } = options;

  // 创建分析器节点
  const analyzer = context.createAnalyser();
  analyzer.fftSize = fftSize;
  analyzer.minDecibels = minDecibels;
  analyzer.maxDecibels = maxDecibels;
  analyzer.smoothingTimeConstant = smoothingTimeConstant;

  // 创建数据缓冲
  const frequencyData = new Uint8Array(analyzer.frequencyBinCount);
  const timeData = new Uint8Array(analyzer.fftSize);

  return {
    analyzer,

    // 获取频率数据
    getFrequencyData: () => {
      analyzer.getByteFrequencyData(frequencyData);
      return frequencyData;
    },

    // 获取时域数据
    getTimeData: () => {
      analyzer.getByteTimeDomainData(timeData);
      return timeData;
    },

    // 连接音频源
    connectSource: (source: AudioNode) => {
      source.connect(analyzer);
      analyzer.connect(context.destination);
    },
  };
}

/**
 * 音频录制器
 */
interface AudioRecorder {
  /**
   * 开始录制
   */
  start: () => Promise<void>;

  /**
   * 暂停录制
   */
  pause: () => void;

  /**
   * 恢复录制
   */
  resume: () => void;

  /**
   * 停止录制
   */
  stop: () => Promise<Blob>;

  /**
   * 获取录制状态
   */
  getState: () => "inactive" | "recording" | "paused";

  /**
   * 获取录制时长(毫秒)
   */
  getDuration: () => number;
}

/**
 * 创建音频录制器
 * @param options 录制选项
 */
export async function createAudioRecorder(options: AudioRecordOptions = {}): Promise<AudioRecorder> {
  if (!isRecordingSupported()) {
    throw new Error("浏览器不支持录音功能");
  }

  const { mimeType = "audio/webm", audioBitsPerSecond = 128000, sampleRate, channelCount = 1 } = options;

  // 获取媒体流
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount,
      sampleRate,
    },
  });

  // 创建媒体记录器
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: getSupportedMimeType(mimeType),
    audioBitsPerSecond,
  });

  const audioChunks: Blob[] = [];
  let startTime = 0;
  let pausedDuration = 0;
  let pauseStartTime = 0;

  // 收集录音数据
  mediaRecorder.ondataavailable = event => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  // 录音完成处理
  let resolveStop: ((blob: Blob) => void) | null = null;
  mediaRecorder.onstop = () => {
    // 停止所有轨道
    stream.getTracks().forEach(track => track.stop());

    // 合并音频块
    const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });

    if (resolveStop) {
      resolveStop(audioBlob);
      resolveStop = null;
    }
  };

  return {
    start: async () => {
      audioChunks.length = 0;
      startTime = Date.now();
      pausedDuration = 0;
      mediaRecorder.start(100); // 每100ms触发一次ondataavailable
    },

    pause: () => {
      if (mediaRecorder.state === "recording") {
        mediaRecorder.pause();
        pauseStartTime = Date.now();
      }
    },

    resume: () => {
      if (mediaRecorder.state === "paused") {
        mediaRecorder.resume();
        pausedDuration += Date.now() - pauseStartTime;
      }
    },

    stop: () => {
      return new Promise<Blob>(resolve => {
        resolveStop = resolve;

        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        } else {
          // 如果已经处于非活动状态，直接返回空白音频
          resolve(new Blob([], { type: mediaRecorder.mimeType }));
        }
      });
    },

    getState: () => mediaRecorder.state,

    getDuration: () => {
      if (mediaRecorder.state === "inactive") {
        return 0;
      }

      const currentPausedDuration = mediaRecorder.state === "paused" ? Date.now() - pauseStartTime : 0;

      return Date.now() - startTime - pausedDuration - currentPausedDuration;
    },
  };
}

/**
 * 获取浏览器支持的MIME类型
 * @param preferredType 首选类型
 */
function getSupportedMimeType(preferredType: string): string {
  const types = [preferredType, "audio/webm", "audio/mp4", "audio/ogg", "audio/wav"];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return "";
}

/**
 * 将AudioBuffer转换为WAV格式Blob
 * @param buffer 音频缓冲
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChannels = buffer.numberOfChannels;
  const length = buffer.length * numOfChannels * 2;
  const sampleRate = buffer.sampleRate;
  const result = new ArrayBuffer(44 + length);
  const view = new DataView(result);

  // RIFF标识
  writeString(view, 0, "RIFF");
  // 文件长度
  view.setUint32(4, 36 + length, true);
  // WAVE标识
  writeString(view, 8, "WAVE");
  // fmt块标识
  writeString(view, 12, "fmt ");
  // fmt块长度
  view.setUint32(16, 16, true);
  // 编码格式 (1 为PCM)
  view.setUint16(20, 1, true);
  // 声道数
  view.setUint16(22, numOfChannels, true);
  // 采样率
  view.setUint32(24, sampleRate, true);
  // 每秒字节数
  view.setUint32(28, sampleRate * numOfChannels * 2, true);
  // 每个样本的字节数
  view.setUint16(32, numOfChannels * 2, true);
  // 每个样本的位数
  view.setUint16(34, 16, true);
  // data块标识
  writeString(view, 36, "data");
  // data块长度
  view.setUint32(40, length, true);

  // 交叉合并声道数据
  const channelData = [];
  for (let i = 0; i < numOfChannels; i++) {
    channelData.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numOfChannels; channel++) {
      // 转换浮点数为16位整数
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
      const value = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, value, true);
      offset += 2;
    }
  }

  return new Blob([result], { type: "audio/wav" });
}

/**
 * 写入字符串到DataView
 */
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * 创建音频可视化器
 * @param canvas 画布元素
 * @param analyzer 分析器节点
 */
export function createAudioVisualizer(
  canvas: HTMLCanvasElement,
  analyzer: AnalyserNode,
): {
  start: () => void;
  stop: () => void;
  setColor: (color: string) => void;
  setStyle: (style: "bars" | "wave" | "circle") => void;
} {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("无法获取canvas上下文");
  }

  let animationId: number | null = null;
  let visualStyle: "bars" | "wave" | "circle" = "bars";
  let color = "#00AAFF";

  // 调整canvas大小
  function resizeCanvas() {
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
  }

  // 初始化尺寸
  resizeCanvas();

  // 监听窗口大小变化
  window.addEventListener("resize", resizeCanvas);

  // 绘制频谱柱状图
  function drawBars() {
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyzer.getByteFrequencyData(dataArray);

    ctx!.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;

      ctx!.fillStyle = color;
      ctx!.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  // 绘制波形图
  function drawWave() {
    const bufferLength = analyzer.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    analyzer.getByteTimeDomainData(dataArray);

    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    ctx!.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx!.moveTo(x, y);
      } else {
        ctx!.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx!.lineTo(canvas.width, canvas.height / 2);
    ctx!.strokeStyle = color;
    ctx!.lineWidth = 2;
    ctx!.stroke();
  }

  // 绘制圆形频谱
  function drawCircle() {
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyzer.getByteFrequencyData(dataArray);

    ctx!.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx!.beginPath();
    ctx!.arc(centerX, centerY, radius * 0.1, 0, Math.PI * 2);
    ctx!.fillStyle = color;
    ctx!.fill();

    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i] / 255;
      const barHeight = value * radius * 0.9;

      const angle = (i * Math.PI * 2) / bufferLength;
      const x1 = centerX + Math.cos(angle) * radius * 0.1;
      const y1 = centerY + Math.sin(angle) * radius * 0.1;
      const x2 = centerX + Math.cos(angle) * (radius * 0.1 + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius * 0.1 + barHeight);

      ctx!.beginPath();
      ctx!.moveTo(x1, y1);
      ctx!.lineTo(x2, y2);
      ctx!.strokeStyle = color;
      ctx!.lineWidth = 2;
      ctx!.stroke();
    }
  }

  // 动画循环
  function draw() {
    switch (visualStyle) {
      case "bars":
        drawBars();
        break;
      case "wave":
        drawWave();
        break;
      case "circle":
        drawCircle();
        break;
    }

    animationId = requestAnimationFrame(draw);
  }

  return {
    start: () => {
      if (!animationId) {
        draw();
      }
    },

    stop: () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        ctx!.clearRect(0, 0, canvas.width, canvas.height);
      }
    },

    setColor: (newColor: string) => {
      color = newColor;
    },

    setStyle: (style: "bars" | "wave" | "circle") => {
      visualStyle = style;
    },
  };
}

// 同时提供命名空间对象
export const audioUtils = {
  createAudioContext,
  isAudioSupported,
  isRecordingSupported,
  getSupportedAudioFormats,
  loadAudio,
  playAudio,
  createAudioAnalyzer,
  createAudioRecorder,
  audioBufferToWav,
  createAudioVisualizer,
};

// 默认导出命名空间对象
export default audioUtils;
