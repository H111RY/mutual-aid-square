const API_KEY = import.meta.env.VITE_IMGBB_API_KEY || ''
const UPLOAD_URL = 'https://api.imgbb.com/1/upload'

/**
 * 上传图片到 imgbb（免费图床）
 *
 * 流程：file → base64 → POST imgbb → 返回 URL
 * onProgress 仅提供开始/完成两个节点（imgbb 不支持分片进度）
 *
 * @param {File|Blob} file       — 压缩后的图片文件
 * @param {Function}  onProgress — 进度回调（简化：0 → 1）
 * @returns {Promise<{url: string, thumb: string}>}
 */
export async function uploadImage(file, onProgress) {
  if (!API_KEY) {
    throw new Error('请先配置 VITE_IMGBB_API_KEY')
  }

  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })

  const base64Data = base64.split(',')[1]

  const formData = new FormData()
  formData.append('key', API_KEY)
  formData.append('image', base64Data)
  if (file.name) formData.append('name', file.name)

  if (onProgress) onProgress({ loaded: 0, total: 1 })

  const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData })
  const json = await res.json()

  if (!json.success) {
    throw new Error(json.error?.message || '上传失败，请重试')
  }

  if (onProgress) onProgress({ loaded: 1, total: 1 })

  return {
    url: json.data.url,
    thumb: json.data.thumb?.url || json.data.url
  }
}

/**
 * 语音转文字（降级 ASR）
 */
export function voiceToText(audioBlob) {
  return Promise.resolve({ text: '' })
}
