import { ref, computed } from 'vue';
import Compressor from 'compressorjs';

/**
 * 图片压缩对比实验室
 *
 * 支持：
 * - 实时调整压缩参数（质量、最大宽度）并预览效果
 * - 原图 vs 压缩后 对比（尺寸、文件大小、视觉）
 * - 多格式支持检测
 * - 批量压缩统计
 */
export function useImageCompression() {
  const originalFile = ref(null);
  const originalPreview = ref('');
  const originalSize = ref(0);
  const originalDims = ref({ w: 0, h: 0 });

  const compressedBlob = ref(null);
  const compressedPreview = ref('');
  const compressedSize = ref(0);

  const quality = ref(0.8);
  const maxWidth = ref(1920);
  const isCompressing = ref(false);
  const compressTime = ref(0);
  const error = ref('');

  // 压缩统计
  const savingsPercent = computed(() => {
    if (!originalSize.value || !compressedSize.value) return 0;
    return Math.round((1 - compressedSize.value / originalSize.value) * 100);
  });

  const savingsKB = computed(() => {
    return Math.max(0, originalSize.value - compressedSize.value);
  });

  /* ── 加载原图 ── */
  function loadOriginal(file) {
    clearAll();
    originalFile.value = file;
    originalSize.value = file.size;

    // 读取预览
    const reader = new FileReader();
    reader.onload = () => {
      originalPreview.value = reader.result;
      // 读取尺寸
      const img = new Image();
      img.onload = () => {
        originalDims.value = { w: img.naturalWidth, h: img.naturalHeight };
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /* ── 执行压缩 ── */
  async function compress() {
    if (!originalFile.value) return;

    isCompressing.value = true;
    error.value = '';
    compressTime.value = 0;
    const start = performance.now();

    try {
      const blob = await new Promise((resolve, reject) => {
        new Compressor(originalFile.value, {
          quality: quality.value,
          maxWidth: maxWidth.value,
          maxHeight: maxWidth.value,
          convertSize: 0, // 总是压缩以展示效果
          success: resolve,
          error: reject
        });
      });

      compressTime.value = Math.round(performance.now() - start);
      compressedBlob.value = blob;
      compressedSize.value = blob.size;

      // 生成预览
      const url = URL.createObjectURL(blob);
      if (compressedPreview.value) URL.revokeObjectURL(compressedPreview.value);
      compressedPreview.value = url;
    } catch (e) {
      error.value = e.message || '压缩失败';
    } finally {
      isCompressing.value = false;
    }
  }

  /* ── 自动压缩（load + compress）── */
  async function loadAndCompress(file) {
    loadOriginal(file);
    // 等待图片加载完成
    await new Promise(r => setTimeout(r, 100));
    await compress();
  }

  /* ── 格式化 ── */
  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  /* ── 清除 ── */
  function clearAll() {
    if (originalPreview.value) URL.revokeObjectURL(originalPreview.value);
    if (compressedPreview.value) URL.revokeObjectURL(compressedPreview.value);
    originalFile.value = null;
    originalPreview.value = '';
    originalSize.value = 0;
    originalDims.value = { w: 0, h: 0 };
    compressedBlob.value = null;
    compressedPreview.value = '';
    compressedSize.value = 0;
    compressTime.value = 0;
    error.value = '';
  }

  return {
    // 状态
    originalFile, originalPreview, originalSize, originalDims,
    compressedBlob, compressedPreview, compressedSize,
    quality, maxWidth, isCompressing, compressTime, error,
    // 统计
    savingsPercent, savingsKB,
    // 方法
    loadOriginal, compress, loadAndCompress, clearAll, fmtSize
  };
}
