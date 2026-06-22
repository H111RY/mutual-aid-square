import { ref, computed } from 'vue';
import Compressor from 'compressorjs';
import { uploadImage } from '@/api/upload';

/**
 * 图片上传 composable
 *
 * 流程：选择文件 → 本地预览 → 前端压缩 → 上传服务端 → 获取 URL
 * 每张图片独立追踪：compressing → uploading → done / error
 */
export function useImageUpload(options = {}) {
  const { maxCount = 9, maxWidth = 1920, quality = 0.8 } = options;

  const images = ref([]);
  // 每项: { id, file, preview (blob URL), compressed (Blob),
  //         original (server URL), thumb (server URL),
  //         progress: 0~100, status: 'compressing'|'uploading'|'done'|'error',
  //         errorMsg: '' }

  let idCounter = 0;

  const uploadingCount = computed(() =>
    images.value.filter(i => i.status === 'compressing' || i.status === 'uploading').length
  );
  const isUploading = computed(() => uploadingCount.value > 0);
  const doneImages = computed(() => images.value.filter(i => i.status === 'done'));
  const hasError = computed(() => images.value.some(i => i.status === 'error'));

  function compress(file) {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality,
        maxWidth,
        maxHeight: 1920,
        convertSize: 1024 * 1024,       // 超过 1MB 才压缩
        success: resolve,
        error: reject
      });
    });
  }

  function createPreview(file) {
    return URL.createObjectURL(file);
  }

  async function addImages(files) {
    const fileList = Array.from(files);
    const remain = maxCount - images.value.length;

    if (remain <= 0) {
      alert(`最多上传${maxCount}张图片`);
      return;
    }

    const toAdd = fileList.slice(0, remain);
    if (fileList.length > remain) {
      alert(`最多上传${maxCount}张图片，已自动选取前${remain}张`);
    }

    for (const file of toAdd) {
      const id = ++idCounter;
      const preview = createPreview(file);

      const imgEntry = {
        id, file, preview,
        compressed: null,
        original: '',
        thumb: '',
        progress: 0,
        status: 'compressing',
        errorMsg: ''
      };
      images.value.push(imgEntry);

      try {
        // 阶段 1：压缩
        const compressed = await compress(file);
        const entry = images.value.find(i => i.id === id);
        if (!entry) return;
        entry.compressed = compressed;
        entry.status = 'uploading';
        entry.progress = 0;

        // 阶段 2：上传
        const res = await uploadImage(compressed, (progressEvent) => {
          const entry2 = images.value.find(i => i.id === id);
          if (entry2 && progressEvent.total) {
            entry2.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          }
        });

        const entry3 = images.value.find(i => i.id === id);
        if (!entry3) return;
        entry3.original = res.url || res.original || '';
        entry3.thumb = res.thumb || res.url || res.original || '';
        entry3.status = 'done';
        entry3.progress = 100;
        // 上传成功后释放本地预览 blob（保留 compressed 用于重试）
        if (entry3.preview) { URL.revokeObjectURL(entry3.preview); entry3.preview = ''; }
      } catch (err) {
        const entry4 = images.value.find(i => i.id === id);
        if (!entry4) return;
        entry4.status = 'error';
        entry4.errorMsg = err.response?.data?.message || err.message || '上传失败';
      }
    }
  }

  function removeImage(id) {
    const img = images.value.find(i => i.id === id);
    if (img?.preview) URL.revokeObjectURL(img.preview);
    images.value = images.value.filter(i => i.id !== id);
  }

  function retryImage(id) {
    const img = images.value.find(i => i.id === id);
    if (!img || img.status !== 'error') return;
    img.status = 'uploading';
    img.progress = 0;
    img.errorMsg = '';
    // 重新上传压缩后的文件
    uploadImage(img.compressed || img.file, (progressEvent) => {
      const entry = images.value.find(i => i.id === id);
      if (entry && progressEvent.total) {
        entry.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      }
    })
      .then((res) => {
        const entry = images.value.find(i => i.id === id);
        if (!entry) return;
        entry.original = res.url || res.original || '';
        entry.thumb = res.thumb || res.url || '';
        entry.status = 'done';
        entry.progress = 100;
        if (entry.preview) { URL.revokeObjectURL(entry.preview); entry.preview = ''; }
      })
      .catch((err) => {
        const entry = images.value.find(i => i.id === id);
        if (!entry) return;
        entry.status = 'error';
        entry.errorMsg = err.response?.data?.message || err.message || '重试失败';
      });
  }

  function clearImages() {
    images.value.forEach(img => {
      if (img.preview) URL.revokeObjectURL(img.preview);
    });
    images.value = [];
  }

  /** 获取已上传完成的图片数据，用于提交帖子 */
  function getUploadedImages() {
    return doneImages.value.map(img => ({
      original: img.original,
      thumb: img.thumb
    }));
  }

  return {
    images,
    isUploading,
    uploadingCount,
    doneImages,
    hasError,
    addImages,
    removeImage,
    retryImage,
    clearImages,
    getUploadedImages
  };
}
