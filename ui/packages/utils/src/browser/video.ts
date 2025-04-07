/**
 * 视频处理工具
 * 提供Web视频API的常用功能封装
 */

/**
 * 视频播放选项
 */
export interface VideoPlayOptions {
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
   * 静音
   */
  muted?: boolean;

  /**
   * 画面填充模式
   */
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
}

/**
 * 视频捕获选项
 */
export interface VideoCaptureOptions {
  /**
   * 视频宽度
   */
  width?: number | { min?: number; ideal?: number; max?: number };

  /**
   * 视频高度
   */
  height?: number | { min?: number; ideal?: number; max?: number };

  /**
   * 帧率
   */
  frameRate?: number | { min?: number; ideal?: number; max?: number };

  /**
   * 摄像头朝向（前置或后置）
   */
  facingMode?: "user" | "environment" | { exact: "user" | "environment" };

  /**
   * 设备ID
   */
  deviceId?: string | { exact: string };

  /**
   * 是否包含音频
   */
  audio?: boolean;
}

/**
 * 视频录制选项
 */
export interface VideoRecordOptions {
  /**
   * 视频MIME类型
   */
  mimeType?: string;

  /**
   * 视频比特率
   */
  videoBitsPerSecond?: number;

  /**
   * 音频比特率
   */
  audioBitsPerSecond?: number;

  /**
   * 每多少毫秒触发一次数据可用事件
   */
  timeslice?: number;
}

/**
 * 视频截图选项
 */
export interface VideoSnapshotOptions {
  /**
   * 输出宽度
   */
  width?: number;

  /**
   * 输出高度
   */
  height?: number;

  /**
   * 图像类型
   */
  type?: "image/png" | "image/jpeg" | "image/webp";

  /**
   * 图像质量（JPEG和WEBP适用，0-1）
   */
  quality?: number;
}

/**
 * 检查浏览器是否支持指定的视频格式
 * @param format 视频格式
 */
export function isSupportedVideoFormat(format: string): boolean {
  const video = document.createElement("video");
  return !!video.canPlayType(format);
}

/**
 * 获取浏览器支持的视频格式
 */
export function getSupportedVideoFormats(): Record<string, boolean> {
  const video = document.createElement("video");

  return {
    mp4: !!video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"').replace(/^no$/, ""),
    webm: !!video.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, ""),
    ogg: !!video.canPlayType('video/ogg; codecs="theora, vorbis"').replace(/^no$/, ""),
    mov: !!video.canPlayType("video/quicktime").replace(/^no$/, ""),
    avi: !!video.canPlayType("video/x-msvideo").replace(/^no$/, ""),
    wmv: !!video.canPlayType("video/x-ms-wmv").replace(/^no$/, ""),
    flv: !!video.canPlayType("video/x-flv").replace(/^no$/, ""),
    "3gp": !!video.canPlayType("video/3gpp").replace(/^no$/, ""),
    hls: !!video.canPlayType("application/x-mpegURL").replace(/^no$/, ""),
    dash: !!video.canPlayType("application/dash+xml").replace(/^no$/, ""),
  };
}

/**
 * 创建视频元素
 * @param source 视频源
 * @param options 播放选项
 */
export function createVideoElement(source: string | MediaStream, options: VideoPlayOptions = {}): HTMLVideoElement {
  const {
    volume = 1,
    playbackRate = 1,
    loop = false,
    autoplay = true,
    startTime = 0,
    muted = false,
    objectFit = "contain",
  } = options;

  const video = document.createElement("video");
  video.volume = volume;
  video.playbackRate = playbackRate;
  video.loop = loop;
  video.autoplay = autoplay;
  video.muted = muted;
  video.style.objectFit = objectFit;

  if (typeof source === "string") {
    video.src = source;
    if (startTime > 0) {
      video.currentTime = startTime;
    }
  } else {
    video.srcObject = source;
  }

  return video;
}

/**
 * 创建视频播放控制器
 * @param videoEl 视频元素或选择器
 */
export function createVideoController(videoEl: HTMLVideoElement | string): {
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleMute: () => boolean;
  toggleFullscreen: () => Promise<void>;
  getDuration: () => number;
  getCurrentTime: () => number;
  getState: () => "playing" | "paused" | "ended" | "loading";
  getElement: () => HTMLVideoElement;
  on: (event: string, callback: (event: Event) => void) => void;
  off: (event: string, callback: (event: Event) => void) => void;
} {
  // 获取视频元素
  const video = typeof videoEl === "string" ? (document.querySelector(videoEl) as HTMLVideoElement) : videoEl;

  if (!video) {
    throw new Error("视频元素不存在");
  }

  // 进入全屏模式
  async function enterFullscreen() {
    if (video.requestFullscreen) {
      await video.requestFullscreen();
    } else if ((video as any).webkitRequestFullscreen) {
      await (video as any).webkitRequestFullscreen();
    } else if ((video as any).msRequestFullscreen) {
      await (video as any).msRequestFullscreen();
    } else if ((video as any).mozRequestFullScreen) {
      await (video as any).mozRequestFullScreen();
    }
  }

  // 退出全屏模式
  async function exitFullscreen() {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      await (document as any).mozCancelFullScreen();
    }
  }

  return {
    play: async () => {
      if (video.paused || video.ended) {
        try {
          await video.play();
        } catch (error) {
          console.error("视频播放失败:", error);
          throw error;
        }
      }
    },

    pause: () => {
      if (!video.paused) {
        video.pause();
      }
    },

    stop: () => {
      video.pause();
      video.currentTime = 0;
    },

    seekTo: (time: number) => {
      if (time >= 0 && time <= video.duration) {
        video.currentTime = time;
      }
    },

    setVolume: (volume: number) => {
      if (volume >= 0 && volume <= 1) {
        video.volume = volume;
      }
    },

    setPlaybackRate: (rate: number) => {
      if (rate > 0) {
        video.playbackRate = rate;
      }
    },

    toggleMute: () => {
      video.muted = !video.muted;
      return video.muted;
    },

    toggleFullscreen: async () => {
      if (document.fullscreenElement === video) {
        await exitFullscreen();
      } else {
        await enterFullscreen();
      }
    },

    getDuration: () => video.duration,

    getCurrentTime: () => video.currentTime,

    getState: () => {
      if (video.seeking || video.readyState < 3) {
        return "loading";
      }
      if (video.ended) {
        return "ended";
      }
      if (video.paused) {
        return "paused";
      }
      return "playing";
    },

    getElement: () => video,

    on: (event: string, callback: (event: Event) => void) => {
      video.addEventListener(event, callback);
    },

    off: (event: string, callback: (event: Event) => void) => {
      video.removeEventListener(event, callback);
    },
  };
}

/**
 * 创建视频元素并挂载到容器
 * @param container 容器元素或选择器
 * @param source 视频源
 * @param options 播放选项
 */
export function createVideo(
  container: HTMLElement | string,
  source: string | MediaStream,
  options: VideoPlayOptions = {},
): ReturnType<typeof createVideoController> {
  // 获取容器元素
  const containerEl = typeof container === "string" ? (document.querySelector(container) as HTMLElement) : container;

  if (!containerEl) {
    throw new Error("容器元素不存在");
  }

  // 创建视频元素
  const video = createVideoElement(source, options);
  containerEl.appendChild(video);

  // 创建控制器
  return createVideoController(video);
}

/**
 * 获取视频截图
 * @param video 视频元素或视频控制器
 * @param options 截图选项
 */
export function captureVideoFrame(
  video: HTMLVideoElement | ReturnType<typeof createVideoController>,
  options: VideoSnapshotOptions = {},
): {
  dataUrl: string;
  blob: Promise<Blob>;
  canvas: HTMLCanvasElement;
} {
  // 获取视频元素
  const videoEl = "getElement" in video ? video.getElement() : video;

  const { width = videoEl.videoWidth, height = videoEl.videoHeight, type = "image/png", quality = 0.95 } = options;

  // 创建画布
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  // 绘制视频帧
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("无法获取Canvas 2D上下文");
  }

  ctx.drawImage(videoEl, 0, 0, width, height);

  // 获取数据URL
  const dataUrl = canvas.toDataURL(type, quality);

  // 获取Blob数据
  const blobPromise = new Promise<Blob>(resolve => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob);
        } else {
          // 如果toBlob失败，尝试通过dataUrl创建blob
          const binary = atob(dataUrl.split(",")[1]);
          const array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
          }
          resolve(new Blob([array], { type }));
        }
      },
      type,
      quality,
    );
  });

  return {
    dataUrl,
    blob: blobPromise,
    canvas,
  };
}

/**
 * 获取可用视频输入设备
 */
export async function getVideoDevices(): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    throw new Error("浏览器不支持媒体设备枚举");
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === "videoinput");
  } catch (error) {
    console.error("获取视频设备失败:", error);
    throw error;
  }
}

/**
 * 获取摄像头流
 * @param options 捕获选项
 */
export async function getCameraStream(options: VideoCaptureOptions = {}): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("浏览器不支持摄像头访问");
  }

  const {
    width = { ideal: 1280 },
    height = { ideal: 720 },
    frameRate = { ideal: 30 },
    facingMode = "user",
    deviceId,
    audio = true,
  } = options;

  const constraints: MediaStreamConstraints = {
    video: {
      width,
      height,
      frameRate,
      facingMode,
      ...(deviceId ? { deviceId } : {}),
    },
    audio,
  };

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error("获取摄像头流失败:", error);
    throw error;
  }
}

/**
 * 获取屏幕共享流
 * @param audio 是否包含系统音频
 */
export async function getScreenStream(audio: boolean = false): Promise<MediaStream> {
  if (!navigator.mediaDevices || !(navigator.mediaDevices as any).getDisplayMedia) {
    throw new Error("浏览器不支持屏幕共享");
  }

  try {
    return await (navigator.mediaDevices as any).getDisplayMedia({
      video: true,
      audio,
    });
  } catch (error) {
    console.error("获取屏幕共享流失败:", error);
    throw error;
  }
}

/**
 * 视频录制器接口
 */
interface VideoRecorder {
  /**
   * 开始录制
   */
  start: () => void;

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
  stop: () => Promise<{
    blob: Blob;
    url: string;
    duration: number;
  }>;

  /**
   * 获取录制状态
   */
  getState: () => "inactive" | "recording" | "paused";

  /**
   * 获取已录制时长（毫秒）
   */
  getDuration: () => number;
}

/**
 * 创建视频录制器
 * @param stream 媒体流
 * @param options 录制选项
 */
export function createVideoRecorder(stream: MediaStream, options: VideoRecordOptions = {}): VideoRecorder {
  if (!window.MediaRecorder) {
    throw new Error("浏览器不支持MediaRecorder API");
  }

  const {
    mimeType = getSupportedMimeType(),
    videoBitsPerSecond = 2500000,
    audioBitsPerSecond = 128000,
    timeslice = 1000,
  } = options;

  // 创建媒体记录器
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond,
    audioBitsPerSecond,
  });

  const chunks: Blob[] = [];
  let startTime = 0;
  let pausedTime = 0;
  let pauseStartTime = 0;
  let totalPausedTime = 0;

  // 收集记录数据
  recorder.ondataavailable = event => {
    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  return {
    start: () => {
      chunks.length = 0;
      startTime = Date.now();
      totalPausedTime = 0;
      recorder.start(timeslice);
    },

    pause: () => {
      if (recorder.state === "recording") {
        recorder.pause();
        pauseStartTime = Date.now();
      }
    },

    resume: () => {
      if (recorder.state === "paused") {
        recorder.resume();
        totalPausedTime += Date.now() - pauseStartTime;
      }
    },

    stop: async () => {
      return new Promise(resolve => {
        recorder.onstop = () => {
          const duration = recorder.state !== "inactive" ? 0 : Date.now() - startTime - totalPausedTime;

          // 合并数据块
          const blob = new Blob(chunks, { type: recorder.mimeType });
          const url = URL.createObjectURL(blob);

          resolve({
            blob,
            url,
            duration,
          });
        };

        if (recorder.state !== "inactive") {
          recorder.stop();
        } else {
          recorder.onstop(new Event("stop"));
        }
      });
    },

    getState: () => recorder.state,

    getDuration: () => {
      if (recorder.state === "inactive") {
        return 0;
      }

      const current = Date.now();
      let pauseTime = totalPausedTime;

      if (recorder.state === "paused") {
        pauseTime += current - pauseStartTime;
      }

      return current - startTime - pauseTime;
    },
  };
}

/**
 * 获取浏览器支持的视频MIME类型
 */
function getSupportedMimeType(): string {
  // 按优先级排序的类型
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=h264,opus",
    "video/mp4;codecs=h264,aac",
    "video/webm",
    "video/mp4",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return "";
}

/**
 * 提取视频元数据
 * @param source 视频URL或File对象
 */
export function getVideoMetadata(source: string | File): Promise<{
  duration: number;
  width: number;
  height: number;
  hasAudio: boolean;
  hasVideo: boolean;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");

    // 设置URL
    if (typeof source === "string") {
      video.src = source;
    } else {
      video.src = URL.createObjectURL(source);
    }

    video.preload = "metadata";

    // 一次性加载元数据
    video.addEventListener("loadedmetadata", () => {
      // 检测音频轨道
      let hasAudio = false;
      if ("captureStream" in video) {
        const stream = (video as any).captureStream();
        hasAudio = stream.getAudioTracks().length > 0;
      }

      const result = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        hasAudio,
        hasVideo: video.videoWidth > 0 && video.videoHeight > 0,
      };

      // 如果是Blob URL，需要释放
      if (typeof source !== "string") {
        URL.revokeObjectURL(video.src);
      }

      resolve(result);
    });

    // 错误处理
    video.addEventListener("error", () => {
      if (typeof source !== "string") {
        URL.revokeObjectURL(video.src);
      }
      reject(new Error("视频元数据加载失败"));
    });
  });
}

/**
 * 从视频流创建视频预览
 * @param stream 媒体流
 * @param container 容器元素或选择器
 * @param options 播放选项
 */
export function createStreamPreview(
  stream: MediaStream,
  container: HTMLElement | string,
  options: VideoPlayOptions = {},
): ReturnType<typeof createVideoController> {
  return createVideo(container, stream, {
    ...options,
    autoplay: true,
    muted: true,
  });
}

/**
 * 从视频帧创建GIF动画
 * @param videoElement 视频元素
 * @param options 选项
 */
export async function createGifFromVideo(
  videoElement: HTMLVideoElement,
  options: {
    startTime?: number;
    duration?: number;
    fps?: number;
    width?: number;
    height?: number;
    quality?: number;
  } = {},
): Promise<Blob> {
  // 这个函数需要依赖GIF编码库，如gif.js
  // 这里只提供一个简单的实现方案，假设已有GIF.js库
  throw new Error("需要引入GIF.js库才能使用此功能");

  /*
  // 示例实现 (需要gif.js库)
  const {
    startTime = 0,
    duration = 1,
    fps = 10,
    width = videoElement.videoWidth / 2,
    height = videoElement.videoHeight / 2,
    quality = 10
  } = options;

  return new Promise((resolve, reject) => {
    // 确保视频已加载
    if (videoElement.readyState < 2) {
      videoElement.addEventListener('loadeddata', onVideoReady);
    } else {
      onVideoReady();
    }

    function onVideoReady() {
      // 创建GIF编码器 (使用gif.js)
      const gif = new GIF({
        workers: 2,
        quality,
        width,
        height,
        workerScript: '/path/to/gif.worker.js'
      });

      // 设置完成事件
      gif.on('finished', blob => {
        resolve(blob);
      });

      // 设置开始时间
      videoElement.currentTime = startTime;

      // 等待视频定位
      videoElement.addEventListener('seeked', captureFrames);

      // 捕获帧
      function captureFrames() {
        videoElement.removeEventListener('seeked', captureFrames);

        const frameCount = Math.floor(duration * fps);
        const frameDelay = 1000 / fps;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        let currentFrame = 0;

        captureFrame();

        function captureFrame() {
          if (currentFrame >= frameCount) {
            gif.render();
            return;
          }

          // 绘制当前帧
          ctx.drawImage(videoElement, 0, 0, width, height);
          gif.addFrame(canvas, { delay: frameDelay, copy: true });

          // 移动到下一帧
          currentFrame++;
          videoElement.currentTime = startTime + (currentFrame / fps);

          // 等待视频定位完成
          videoElement.removeEventListener('seeked', onSeeked);
          videoElement.addEventListener('seeked', onSeeked);
        }

        function onSeeked() {
          videoElement.removeEventListener('seeked', onSeeked);
          captureFrame();
        }
      }
    }
  });
  */
}

// 同时提供命名空间对象
export const videoUtils = {
  isSupportedVideoFormat,
  getSupportedVideoFormats,
  createVideoElement,
  createVideoController,
  createVideo,
  captureVideoFrame,
  getVideoDevices,
  getCameraStream,
  getScreenStream,
  createVideoRecorder,
  getVideoMetadata,
  createStreamPreview,
};

// 默认导出命名空间对象
export default videoUtils;
