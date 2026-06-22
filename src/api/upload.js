import http from './http';

/**
 * 上传图片
 *
 * @param {File|Blob} file       — 图片文件
 * @param {Function}  onProgress — 上传进度回调 (ProgressEvent) => void
 * @returns {Promise<{url: string, thumb: string}>}
 */
export function uploadImage(file, onProgress) {
  const fd = new FormData();
  fd.append('file', file);
  // 不手动设 Content-Type，让 axios 自动带 boundary
  return http.post('/upload/image', fd, {
    __showLoading: false,              // 上传不触发全局 Loading
    onUploadProgress: onProgress
  });
}

/**
 * 语音转文字（降级 ASR）
 *
 * @param {Blob} audioBlob — 录音数据
 * @returns {Promise<{text: string}>}
 */
export function voiceToText(audioBlob) {
  const fd = new FormData();
  fd.append('audio', audioBlob);
  return http.post('/voice/recognize', fd, {
    __showLoading: false,
    timeout: 30000                      // 语音识别超时 30s
  });
}
