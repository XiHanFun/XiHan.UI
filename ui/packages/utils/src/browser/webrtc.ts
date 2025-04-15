/**
 * WebRTC 简化工具
 * 封装WebRTC相关API，简化通信实现
 */

/**
 * WebRTC连接配置
 */
export interface RTCConnectionConfig {
  /**
   * ICE服务器配置
   */
  iceServers?: RTCIceServer[];

  /**
   * ICE传输策略
   */
  iceTransportPolicy?: RTCIceTransportPolicy;

  /**
   * 捆绑策略
   */
  bundlePolicy?: RTCBundlePolicy;

  /**
   * RTCP多路复用
   */
  rtcpMuxPolicy?: RTCRtcpMuxPolicy;
}

/**
 * 信令通道接口
 */
export interface SignalingChannel {
  /**
   * 发送消息
   */
  send: (message: any) => void;

  /**
   * 接收消息
   */
  onMessage: (handler: (message: any) => void) => void;

  /**
   * 连接信令服务器
   */
  connect: () => Promise<void>;

  /**
   * 断开连接
   */
  disconnect: () => void;
}

/**
 * WebRTC连接事件
 */
export interface RTCConnectionEvents {
  /**
   * 本地流就绪
   */
  onLocalStream?: (stream: MediaStream) => void;

  /**
   * 远程流就绪
   */
  onRemoteStream?: (stream: MediaStream) => void;

  /**
   * 连接状态变化
   */
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;

  /**
   * ICE候选就绪
   */
  onIceCandidate?: (candidate: RTCIceCandidate | null) => void;

  /**
   * ICE连接状态变化
   */
  onIceConnectionStateChange?: (state: RTCIceConnectionState) => void;

  /**
   * 协商需要
   */
  onNegotiationNeeded?: () => void;

  /**
   * 数据通道就绪
   */
  onDataChannel?: (channel: RTCDataChannel) => void;

  /**
   * 错误发生
   */
  onError?: (error: Error) => void;
}

/**
 * 检查WebRTC支持情况
 */
export function checkWebRTCSupport(): {
  supported: boolean;
  details: {
    peerConnection: boolean;
    getUserMedia: boolean;
    mediaDevices: boolean;
    mediaRecorder: boolean;
    rtcDataChannel: boolean;
    screenCapture: boolean;
    insertableStreams: boolean;
  };
} {
  const details = {
    peerConnection: typeof RTCPeerConnection !== "undefined",
    getUserMedia:
      typeof navigator.mediaDevices !== "undefined" && typeof navigator.mediaDevices.getUserMedia !== "undefined",
    mediaDevices:
      typeof navigator.mediaDevices !== "undefined" && typeof navigator.mediaDevices.enumerateDevices !== "undefined",
    mediaRecorder: typeof MediaRecorder !== "undefined",
    rtcDataChannel: typeof RTCPeerConnection !== "undefined" && "createDataChannel" in RTCPeerConnection.prototype,
    screenCapture: typeof navigator.mediaDevices !== "undefined" && "getDisplayMedia" in navigator.mediaDevices,
    insertableStreams: typeof RTCRtpSender !== "undefined" && "createEncodedStreams" in RTCRtpSender.prototype,
  };

  return {
    supported: details.peerConnection && details.getUserMedia,
    details,
  };
}

/**
 * 创建WebRTC连接对象
 * @param config 连接配置
 * @param events 事件处理对象
 */
export function createRTCConnection(
  config: RTCConnectionConfig = {},
  events: RTCConnectionEvents = {},
): {
  connection: RTCPeerConnection;
  addTrack: (track: MediaStreamTrack, ...streams: MediaStream[]) => RTCRtpSender;
  removeTrack: (sender: RTCRtpSender) => void;
  createOffer: () => Promise<RTCSessionDescriptionInit>;
  createAnswer: () => Promise<RTCSessionDescriptionInit>;
  setLocalDescription: (description: RTCSessionDescriptionInit) => Promise<void>;
  setRemoteDescription: (description: RTCSessionDescriptionInit) => Promise<void>;
  addIceCandidate: (candidate: RTCIceCandidateInit | null) => Promise<void>;
  createDataChannel: (label: string, options?: RTCDataChannelInit) => RTCDataChannel;
  close: () => void;
} {
  // 默认配置
  const defaultConfig: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
    iceTransportPolicy: "all",
    bundlePolicy: "balanced",
    rtcpMuxPolicy: "require",
  };

  // 合并配置
  const mergedConfig: RTCConfiguration = {
    ...defaultConfig,
    ...config,
  };

  // 创建连接
  const connection = new RTCPeerConnection(mergedConfig);

  // 绑定事件
  connection.ontrack = event => {
    if (events.onRemoteStream && event.streams && event.streams.length) {
      events.onRemoteStream(event.streams[0]);
    }
  };

  connection.onicecandidate = event => {
    if (events.onIceCandidate) {
      events.onIceCandidate(event.candidate);
    }
  };

  connection.oniceconnectionstatechange = () => {
    if (events.onIceConnectionStateChange) {
      events.onIceConnectionStateChange(connection.iceConnectionState);
    }
  };

  connection.onnegotiationneeded = () => {
    if (events.onNegotiationNeeded) {
      events.onNegotiationNeeded();
    }
  };

  connection.ondatachannel = event => {
    if (events.onDataChannel) {
      events.onDataChannel(event.channel);
    }
  };

  connection.onconnectionstatechange = () => {
    if (events.onConnectionStateChange) {
      events.onConnectionStateChange(connection.connectionState);
    }
  };

  return {
    connection,

    // 添加媒体轨道
    addTrack: (track: MediaStreamTrack, ...streams: MediaStream[]) => {
      return connection.addTrack(track, ...streams);
    },

    // 移除媒体轨道
    removeTrack: (sender: RTCRtpSender) => {
      connection.removeTrack(sender);
    },

    // 创建提议
    createOffer: async () => {
      try {
        return await connection.createOffer();
      } catch (error) {
        if (events.onError) {
          events.onError(error instanceof Error ? error : new Error(String(error)));
        }
        throw error;
      }
    },

    // 创建应答
    createAnswer: async () => {
      try {
        return await connection.createAnswer();
      } catch (error) {
        if (events.onError) {
          events.onError(error instanceof Error ? error : new Error(String(error)));
        }
        throw error;
      }
    },

    // 设置本地描述
    setLocalDescription: async (description: RTCSessionDescriptionInit) => {
      try {
        await connection.setLocalDescription(description);
      } catch (error) {
        if (events.onError) {
          events.onError(error instanceof Error ? error : new Error(String(error)));
        }
        throw error;
      }
    },

    // 设置远程描述
    setRemoteDescription: async (description: RTCSessionDescriptionInit) => {
      try {
        await connection.setRemoteDescription(description);
      } catch (error) {
        if (events.onError) {
          events.onError(error instanceof Error ? error : new Error(String(error)));
        }
        throw error;
      }
    },

    // 添加ICE候选
    addIceCandidate: async (candidate: RTCIceCandidateInit | null) => {
      try {
        await connection.addIceCandidate(candidate);
      } catch (error) {
        if (events.onError) {
          events.onError(error instanceof Error ? error : new Error(String(error)));
        }
        throw error;
      }
    },

    // 创建数据通道
    createDataChannel: (label: string, options?: RTCDataChannelInit) => {
      return connection.createDataChannel(label, options);
    },

    // 关闭连接
    close: () => {
      connection.close();
    },
  };
}

/**
 * 创建WebRTC对等连接
 * @param signalingChannel 信令通道
 * @param config 连接配置
 */
export function createPeerConnection(
  signalingChannel: SignalingChannel,
  config: RTCConnectionConfig = {},
): {
  init: (isInitiator?: boolean) => Promise<void>;
  addStream: (stream: MediaStream) => void;
  removeStream: (stream: MediaStream) => void;
  createDataChannel: (label: string, options?: RTCDataChannelInit) => RTCDataChannel;
  close: () => void;
  onRemoteStream: (callback: (stream: MediaStream) => void) => void;
  onDataChannel: (callback: (channel: RTCDataChannel) => void) => void;
  onConnectionStateChange: (callback: (state: RTCPeerConnectionState) => void) => void;
} {
  let rtcConnection: ReturnType<typeof createRTCConnection> | null = null;
  let remoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  let dataChannelCallback: ((channel: RTCDataChannel) => void) | null = null;
  let connectionStateCallback: ((state: RTCPeerConnectionState) => void) | null = null;
  let localStream: MediaStream | null = null;
  let senders: RTCRtpSender[] = [];

  // 处理信令消息
  signalingChannel.onMessage(message => {
    handleSignalingMessage(message).catch(console.error);
  });

  // 处理信令消息
  async function handleSignalingMessage(message: any) {
    if (!rtcConnection) return;

    try {
      if (message.sdp) {
        // 设置远程描述
        await rtcConnection.setRemoteDescription(message);

        // 如果收到提议，创建应答
        if (message.type === "offer") {
          const answer = await rtcConnection.createAnswer();
          await rtcConnection.setLocalDescription(answer);
          signalingChannel.send(answer);
        }
      } else if (message.candidate) {
        // 添加ICE候选
        await rtcConnection.addIceCandidate(message);
      }
    } catch (error) {
      console.error("处理信令消息出错:", error);
    }
  }

  return {
    // 初始化连接
    init: async (isInitiator = false) => {
      // 确保信令通道连接
      await signalingChannel.connect();

      // 创建RTCPeerConnection
      rtcConnection = createRTCConnection(config, {
        onRemoteStream: stream => {
          if (remoteStreamCallback) {
            remoteStreamCallback(stream);
          }
        },

        onDataChannel: channel => {
          if (dataChannelCallback) {
            dataChannelCallback(channel);
          }
        },

        onConnectionStateChange: state => {
          if (connectionStateCallback) {
            connectionStateCallback(state);
          }
        },

        onIceCandidate: candidate => {
          if (candidate) {
            signalingChannel.send(candidate);
          }
        },

        onNegotiationNeeded: async () => {
          if (!rtcConnection || !isInitiator) return;

          try {
            const offer = await rtcConnection.createOffer();
            await rtcConnection.setLocalDescription(offer);
            signalingChannel.send(offer);
          } catch (error) {
            console.error("创建提议失败:", error);
          }
        },
      });

      // 如果有本地流，添加轨道
      if (localStream) {
        localStream.getTracks().forEach(track => {
          if (rtcConnection) {
            senders.push(rtcConnection.addTrack(track, localStream!));
          }
        });
      }

      // 如果是发起方，创建提议
      if (isInitiator && rtcConnection) {
        const offer = await rtcConnection.createOffer();
        await rtcConnection.setLocalDescription(offer);
        signalingChannel.send(offer);
      }
    },

    // 添加媒体流
    addStream: stream => {
      localStream = stream;

      if (rtcConnection) {
        stream.getTracks().forEach(track => {
          senders.push(rtcConnection!.addTrack(track, stream));
        });
      }
    },

    // 移除媒体流
    removeStream: stream => {
      if (rtcConnection) {
        // 移除相关轨道
        const trackSenders = senders.filter(sender => sender.track && stream.getTracks().includes(sender.track));

        trackSenders.forEach(sender => {
          rtcConnection!.removeTrack(sender);
          senders = senders.filter(s => s !== sender);
        });
      }

      // 如果是本地流，清空引用
      if (localStream === stream) {
        localStream = null;
      }
    },

    // 创建数据通道
    createDataChannel: (label, options) => {
      if (!rtcConnection) {
        throw new Error("RTCPeerConnection未初始化");
      }

      return rtcConnection.createDataChannel(label, options);
    },

    // 关闭连接
    close: () => {
      if (rtcConnection) {
        rtcConnection.close();
        rtcConnection = null;
      }

      signalingChannel.disconnect();
    },

    // 监听远程流
    onRemoteStream: callback => {
      remoteStreamCallback = callback;
    },

    // 监听数据通道
    onDataChannel: callback => {
      dataChannelCallback = callback;
    },

    // 监听连接状态变化
    onConnectionStateChange: callback => {
      connectionStateCallback = callback;
    },
  };
}

/**
 * WebRTC数据通道选项
 */
export interface DataChannelOptions extends RTCDataChannelInit {
  /**
   * 通道标签
   */
  label?: string;
}

/**
 * 创建WebRTC数据通道
 * @param connection RTCPeerConnection对象
 * @param options 通道选项
 */
export function createDataChannel(
  connection: RTCPeerConnection,
  options: DataChannelOptions = {},
): {
  channel: RTCDataChannel;
  send: (data: string | Blob | ArrayBuffer | ArrayBufferView) => void;
  onMessage: (callback: (data: any) => void) => void;
  onOpen: (callback: () => void) => void;
  onClose: (callback: () => void) => void;
  onError: (callback: (error: Event) => void) => void;
  close: () => void;
} {
  const {
    label = "dataChannel",
    ordered = true,
    maxPacketLifeTime,
    maxRetransmits,
    protocol = "",
    negotiated = false,
    id,
  } = options;

  // 创建数据通道
  const channel = connection.createDataChannel(label, {
    ordered,
    maxPacketLifeTime,
    maxRetransmits,
    protocol,
    negotiated,
    id,
  });

  return {
    channel,

    // 发送数据
    send: data => {
      if (channel.readyState === "open") {
        channel.send(data as ArrayBufferView);
      } else {
        console.warn("数据通道未打开，无法发送数据");
      }
    },

    // 监听消息
    onMessage: callback => {
      channel.onmessage = event => {
        callback(event.data);
      };
    },

    // 监听打开
    onOpen: callback => {
      if (channel.readyState === "open") {
        callback();
      } else {
        channel.onopen = () => {
          callback();
        };
      }
    },

    // 监听关闭
    onClose: callback => {
      channel.onclose = () => {
        callback();
      };
    },

    // 监听错误
    onError: callback => {
      channel.onerror = event => {
        callback(event);
      };
    },

    // 关闭通道
    close: () => {
      if (channel.readyState !== "closed") {
        channel.close();
      }
    },
  };
}

/**
 * 创建WebSocket信令通道
 * @param url WebSocket URL
 */
export function createWebSocketSignaling(url: string): SignalingChannel {
  let ws: WebSocket | null = null;
  let messageHandler: ((message: any) => void) | null = null;

  return {
    // 发送消息
    send: message => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      } else {
        console.warn("WebSocket未连接，无法发送消息");
      }
    },

    // 接收消息
    onMessage: handler => {
      messageHandler = handler;
    },

    // 连接信令服务器
    connect: () => {
      return new Promise<void>((resolve, reject) => {
        if (ws && ws.readyState !== WebSocket.CLOSED) {
          resolve();
          return;
        }

        ws = new WebSocket(url);

        ws.onopen = () => {
          resolve();
        };

        ws.onmessage = event => {
          if (messageHandler) {
            try {
              const data = JSON.parse(event.data);
              messageHandler(data);
            } catch (error) {
              console.error("解析信令消息失败:", error);
            }
          }
        };

        ws.onerror = error => {
          reject(error);
        };
      });
    },

    // 断开连接
    disconnect: () => {
      if (ws) {
        ws.close();
        ws = null;
      }
    },
  };
}

/**
 * 获取STUN/TURN服务器配置
 */
export function getDefaultIceServers(): RTCIceServer[] {
  return [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ];
}

/**
 * 创建简单对等连接（用于点对点通信）
 * @param signalingChannel 信令通道
 * @param localStream 本地媒体流
 * @param config 连接配置
 */
export function createSimplePeer(
  signalingChannel: SignalingChannel,
  localStream?: MediaStream,
  config: RTCConnectionConfig = {},
): {
  connect: (isInitiator?: boolean) => Promise<void>;
  onRemoteStream: (callback: (stream: MediaStream) => void) => void;
  sendMessage: (message: string | Blob | ArrayBuffer | ArrayBufferView) => void;
  onMessage: (callback: (message: any) => void) => void;
  close: () => void;
} {
  let dataChannel: RTCDataChannel | null = null;
  let messageCallback: ((message: any) => void) | null = null;
  let remoteStreamCallback: ((stream: MediaStream) => void) | null = null;

  // 创建对等连接
  const peer = createPeerConnection(signalingChannel, config);

  // 添加本地流
  if (localStream) {
    peer.addStream(localStream);
  }

  // 监听远程流
  peer.onRemoteStream(stream => {
    if (remoteStreamCallback) {
      remoteStreamCallback(stream);
    }
  });

  // 监听数据通道
  peer.onDataChannel(channel => {
    dataChannel = channel;

    channel.onmessage = event => {
      if (messageCallback) {
        messageCallback(event.data);
      }
    };
  });

  return {
    // 连接
    connect: async (isInitiator = false) => {
      await peer.init(isInitiator);

      // 如果是发起方，创建数据通道
      if (isInitiator) {
        dataChannel = peer.createDataChannel("messageChannel");

        dataChannel.onmessage = event => {
          if (messageCallback) {
            messageCallback(event.data);
          }
        };
      }
    },

    // 监听远程流
    onRemoteStream: callback => {
      remoteStreamCallback = callback;
    },

    // 发送消息
    sendMessage: message => {
      if (dataChannel && dataChannel.readyState === "open") {
        dataChannel.send(message as ArrayBufferView);
      } else {
        console.warn("数据通道未就绪，无法发送消息");
      }
    },

    // 监听消息
    onMessage: callback => {
      messageCallback = callback;
    },

    // 关闭连接
    close: () => {
      peer.close();
    },
  };
}
