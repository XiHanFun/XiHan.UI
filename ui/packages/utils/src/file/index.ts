export {
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
} from "./audio";
export type { AudioPlayOptions, AudioRecordOptions, AudioAnalyzerOptions } from "./audio";

export {
  compressImage as compressImageFile,
  compressText,
  decompressText,
  compressData,
  decompressData,
  compressFile,
  compressBatch,
} from "./compression";
export type { CompressionOptions } from "./compression";

export {
  convertImage,
  imageToDataURL,
  canvasToFile,
  htmlToPdf,
  jsonToCsv,
  csvToJson,
  fileToArrayBuffer,
  arrayBufferToFile,
} from "./conversion";
export type { ImageConversionOptions, AudioConversionOptions } from "./conversion";

// File 导出
export {
  getFileExt,
  downloadFile,
  readLocalFile,
  readLocalFileAsArrayBuffer,
  readLocalFileAsBlob,
  readLocalFileAsDataURL,
} from "./file";

// Image 导出
export {
  preload as preloadImage,
  preloadAll as preloadAllImages,
  isLoaded as isImageLoaded,
  getDominantColor,
  compress as compressImage,
} from "./image";

// Streaming 导出
export {
  isStreamSupported,
  fileToReadableStream,
  streamToBlob,
  streamToFile,
  saveStreamAsFile,
  transformStream,
  filterStream,
  analyzeFileStream,
  encryptStream,
  decryptStream,
  concatStreams,
  streamTextByLine,
} from "./streaming";
export type { StreamOptions, StreamTransformOptions, StreamFilterOptions } from "./streaming";

// Video 导出
export {
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
} from "./video";
export type { VideoPlayOptions, VideoCaptureOptions, VideoRecordOptions, VideoSnapshotOptions } from "./video";

// ZIP 导出
export {
  isZipSupported,
  createZip,
  unzip,
  extractFile,
  listZipContents,
  saveZipFile,
  addFolderToZip,
  mergeZips,
} from "./zip";
export type { ZipEntry, ZipOptions, UnzipOptions } from "./zip";
