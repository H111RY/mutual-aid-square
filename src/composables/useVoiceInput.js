import { ref, computed, onUnmounted } from 'vue';

/**
 * 语音输入 composable — 双路径架构
 *
 * 路径 A（优先）：Web Speech API → 实时流式识别 → onResult/onInterim 回调
 * 路径 B（降级）：MediaRecorder → 录音 → 上传后端 ASR → onResult 回调
 *
 * 暴露统一的状态和方法，上层组件无需关心底层路径
 */
export function useVoiceInput(options = {}) {
  const { lang = 'zh-CN', onResult, onInterim, onError, onStateChange } = options;

  /* ==================================================================
     ── 公共状态 ──
     ================================================================== */
  const status = ref('idle');
  const duration = ref(0);
  const volume = ref(0);
  const interimText = ref('');
  const finalText = ref('');
  const currentLang = ref(lang);
  const errorMessage = ref('');

  // 降级专属状态
  const uploadProgress = ref(0);          // 0~100 上传进度
  const audioUrl = ref('');               // 录音 blob URL，用于播放预览
  const audioBlob = ref(null);            // 原始录音数据

  // 路径标识（供 UI 组件判断渲染哪种交互模式）
  const path = ref('unknown');            // 'webspeech' | 'fallback' | 'unsupported'
  const maxDuration = 60;                 // 最长录音秒数

  const dialects = [
    { code: 'zh-CN',  name: '普通话' },
    { code: 'yue-HK', name: '粤语' },
    { code: 'zh-TW',  name: '闽南语' },
    { code: 'wuu-CN', name: '吴语' },
    { code: 'hak-CN', name: '客家话' },
    { code: 'en-US',  name: 'English' }
  ];

  /* ── 内部变量 ── */
  let recognition = null;
  let mediaRecorder = null;
  let stream = null;
  let audioChunks = [];
  let durationTimer = null;
  let volumeInterval = null;
  let audioContext = null;
  let analyser = null;
  let cancelled = false;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  /* ── 状态机 ── */
  function setStatus(s, errMsg = '') {
    status.value = s;
    errorMessage.value = errMsg;
    onStateChange && onStateChange(s, errMsg);
  }

  // 检测路径
  function detectPath() {
    if (SpeechRecognition) return 'webspeech';
    if (navigator.mediaDevices?.getUserMedia) return 'fallback';
    return 'unsupported';
  }

  /* ==================================================================
     ── 路径 A：Web Speech API（流式识别）──
     ================================================================== */
  function startWebSpeech() {
    try {
      recognition = new SpeechRecognition();
      recognition.lang = currentLang.value;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setStatus('listening');
        startTimer();
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) final += r[0].transcript;
          else interim += r[0].transcript;
        }
        if (final) { finalText.value += final; onResult?.(finalText.value, final); }
        interimText.value = interim;
        onInterim?.(interim);
      };

      recognition.onerror = (event) => {
        const map = {
          'not-allowed':   '麦克风权限未开启，请在浏览器设置中允许访问麦克风',
          'no-speech':     '未检测到语音，请靠近麦克风再试一次',
          'audio-capture': '未找到麦克风设备',
          'network':       '网络连接异常，语音识别需要联网'
        };
        setStatus('error', map[event.error] || '语音识别失败，请重试');
        onError?.(errorMessage.value);
        stopTimer();
      };

      recognition.onend = () => {
        stopTimer();
        if (status.value === 'listening') {
          try { recognition.start(); } catch { setStatus('idle'); }
        }
      };

      recognition.start();
    } catch (e) {
      setStatus('error', '语音识别启动失败: ' + e.message);
    }
  }

  function stopWebSpeech() {
    if (recognition) { recognition.onend = null; recognition.stop(); recognition = null; }
    stopTimer();
  }

  /* ==================================================================
     ── 路径 B：MediaRecorder 降级方案 ──
     ================================================================== */
  async function startFallbackRecording() {
    cancelled = false;
    audioUrl.value = '';
    audioBlob.value = null;
    uploadProgress.value = 0;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setupVolumeMeter(stream);

      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus' : 'audio/webm';
      mediaRecorder = new MediaRecorder(stream, { mimeType: mime });
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        cleanupStream();
        if (cancelled) { setStatus('idle'); return; }

        // 生成音频 blob 用于预览
        const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
        audioBlob.value = blob;
        audioUrl.value = URL.createObjectURL(blob);
        setStatus('preview');  // 新状态：等待用户确认/重录
      };

      mediaRecorder.start(200);
      setStatus('listening');
      startTimer();
    } catch (err) {
      const map = {
        NotAllowedError: '麦克风权限未开启',
        NotFoundError:   '未找到麦克风设备'
      };
      setStatus('error', map[err.name] || '无法访问麦克风');
      onError?.(errorMessage.value);
    }
  }

  function stopFallbackRecording() {
    stopTimer();
    stopVolumeMeter();
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    } else {
      cleanupStream();
      setStatus('idle');
    }
  }

  /** 取消录音（上滑取消手势） */
  function cancelFallbackRecording() {
    cancelled = true;
    stopFallbackRecording();
    audioChunks = [];
  }

  /** 预览后确认上传 → 调用后端 ASR */
  async function confirmAndRecognize() {
    if (!audioBlob.value) return;
    setStatus('uploading');
    uploadProgress.value = 0;

    try {
      const { voiceToText } = await import('@/api/upload');

      // 模拟上传进度（axios onUploadProgress 在实际项目中接入）
      const progressTimer = setInterval(() => {
        if (uploadProgress.value < 90) uploadProgress.value += 10;
      }, 200);

      const res = await voiceToText(audioBlob.value);
      clearInterval(progressTimer);
      uploadProgress.value = 100;

      finalText.value = res.text || '';
      onResult?.(finalText.value, finalText.value);
      setStatus('idle');
    } catch {
      setStatus('error', '语音识别失败，请检查网络后重试');
      onError?.('语音识别失败');
    }
  }

  /** 重新录音（从预览态回到录音） */
  function retryRecording() {
    if (audioUrl.value) { URL.revokeObjectURL(audioUrl.value); audioUrl.value = ''; }
    audioBlob.value = null;
    startFallbackRecording();
  }

  /* ── 音量检测 ── */
  function setupVolumeMeter(mediaStream) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      audioContext.createMediaStreamSource(mediaStream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      volumeInterval = setInterval(() => {
        analyser.getByteFrequencyData(data);
        volume.value = Math.min(100, Math.round(data.reduce((a, b) => a + b, 0) / data.length * 2));
      }, 80);
    } catch { /* ignore */ }
  }

  function stopVolumeMeter() {
    if (volumeInterval) { clearInterval(volumeInterval); volumeInterval = null; }
    if (audioContext?.state !== 'closed') { audioContext?.close().catch(() => {}); }
    audioContext = null; analyser = null; volume.value = 0;
  }

  function cleanupStream() {
    stopVolumeMeter();
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  }

  /* ── 计时器 ── */
  function startTimer() { duration.value = 0; durationTimer = setInterval(() => { duration.value++; }, 1000); }
  function stopTimer()  { if (durationTimer) { clearInterval(durationTimer); durationTimer = null; } }

  /* ==================================================================
     ── 统一入口 ──
     ================================================================== */
  function start() {
    stop();
    interimText.value = '';
    finalText.value = '';
    duration.value = 0; volume.value = 0;
    errorMessage.value = '';
    path.value = detectPath();

    if (path.value === 'webspeech') {
      startWebSpeech();
    } else if (path.value === 'fallback') {
      startFallbackRecording();
    } else {
      setStatus('unsupported');
      onError?.('您的浏览器不支持语音输入');
    }
  }

  function stop() {
    stopTimer();
    if (recognition) stopWebSpeech();
    if (mediaRecorder || stream) stopFallbackRecording();
    if (status.value !== 'error' && status.value !== 'preview') setStatus('idle');
  }

  function toggle() {
    if (status.value === 'listening') stop();
    else if (status.value === 'preview') retryRecording();
    else start();
  }

  function setDialect(code) {
    currentLang.value = code;
    if (status.value === 'listening') { stop(); start(); }
  }

  function clearText() {
    interimText.value = '';
    finalText.value = '';
  }

  /** 完全清理（预览音频 URL 等） */
  function dispose() {
    stop();
    if (audioUrl.value) { URL.revokeObjectURL(audioUrl.value); audioUrl.value = ''; }
  }

  onUnmounted(() => dispose());

  return {
    // 公共
    status, duration, volume,
    interimText, finalText,
    currentLang, errorMessage, path, dialects,
    // 降级专属
    uploadProgress, audioUrl, audioBlob, maxDuration,
    // 方法
    start, stop, toggle,
    setDialect, clearText, dispose,
    cancelFallbackRecording,
    confirmAndRecognize,
    retryRecording
  };
}
