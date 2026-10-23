import { defineEventHandler, readBody, createError, getRequestIP } from 'h3'
import plantumlEncoder from 'plantuml-encoder'

// In-memory sliding-window rate limiter (60 requests per minute per IP)
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 60
const ipRequestLogs = new Map<string, number[]>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const timestamps = ipRequestLogs.get(ip) || []

  // Filter timestamps within the current window
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS)
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }

  recent.push(now)
  ipRequestLogs.set(ip, recent)

  // Periodic memory cleanup when map size exceeds 500
  if (ipRequestLogs.size > 500) {
    for (const [key, times] of ipRequestLogs.entries()) {
      const valid = times.filter(t => now - t < RATE_LIMIT_WINDOW_MS)
      if (valid.length === 0) {
        ipRequestLogs.delete(key)
      } else {
        ipRequestLogs.set(key, valid)
      }
    }
  }

  return true
}

export default defineEventHandler(async (event) => {
  // 1. Rate limiting check
  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  if (!checkRateLimit(clientIp)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Terlalu banyak permintaan render. Silakan tunggu beberapa saat (batas: 60 req/menit).',
    })
  }

  // 2. Read and validate request body
  const body = await readBody(event).catch(() => ({}))
  const { code, format = 'svg' } = body || {}

  if (typeof code !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Parameter "code" wajib berupa string.',
    })
  }

  // Max code size limit: 50 KB
  const MAX_SIZE_BYTES = 50 * 1024
  const codeSizeBytes = Buffer.byteLength(code, 'utf8')
  if (codeSizeBytes > MAX_SIZE_BYTES) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Payload Too Large',
      message: `Ukuran kode melebihi batas 50 KB (${(codeSizeBytes / 1024).toFixed(1)} KB terdeteksi).`,
    })
  }

  const validFormats = ['svg', 'png']
  const requestedFormat = validFormats.includes(format) ? format : 'svg'

  // If code is completely empty or just whitespace
  const trimmed = code.trim()
  if (!trimmed) {
    return {
      success: true,
      isEmpty: true,
      format: requestedFormat,
      data: '',
      directUrl: '',
      encoded: '',
    }
  }

  // 3. Encode code using plantuml-encoder
  let encoded: string
  try {
    encoded = plantumlEncoder.encode(trimmed)
  } catch (encodeErr: any) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Encoding Error',
      message: `Gagal melakukan encode kode PlantUML: ${encodeErr?.message || 'Error tidak diketahui'}`,
    })
  }

  // 4. Construct target URL
  const config = useRuntimeConfig()
  const baseUrl = (config.plantumlServerUrl || 'https://www.plantuml.com/plantuml').replace(/\/+$/, '')
  const directUrl = `${baseUrl}/${requestedFormat}/${encoded}`

  // 5. Fetch rendered diagram from PlantUML server with timeout (10 seconds)
  try {
    const response = await fetch(directUrl, {
      method: 'GET',
      headers: {
        'Accept': requestedFormat === 'svg' ? 'image/svg+xml' : 'image/png',
        'User-Agent': 'PlantUML-Studio/1.0',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (requestedFormat === 'svg') {
      const svgText = await response.text()
      const isSyntaxError = response.status === 400 || svgText.includes('Syntax Error')

      // Extract error detail if available in svg
      let errorDetail = ''
      if (isSyntaxError) {
        const errorMatch = svgText.match(/<text[^>]*>([^<]*(?:Syntax Error|\[From string)[^<]*)<\/text>/i)
        if (errorMatch && errorMatch[1]) {
          errorDetail = errorMatch[1].trim()
        }
      }

      return {
        success: response.ok && !isSyntaxError,
        isSyntaxError,
        errorMessage: isSyntaxError ? (errorDetail || 'Sintaks PlantUML salah. Periksa kembali diagram Anda.') : undefined,
        format: 'svg',
        data: svgText,
        directUrl,
        encoded,
      }
    } else {
      // PNG format
      if (!response.ok) {
        return {
          success: false,
          isSyntaxError: response.status === 400,
          errorMessage: 'Server PlantUML merespons error saat render PNG (status ' + response.status + '). Coba beralih ke format SVG untuk melihat pesan sintaks.',
          format: 'png',
          data: '',
          directUrl,
          encoded,
        }
      }

      const arrayBuffer = await response.arrayBuffer()
      const base64Data = Buffer.from(arrayBuffer).toString('base64')
      const dataUri = `data:image/png;base64,${base64Data}`

      return {
        success: true,
        isSyntaxError: false,
        format: 'png',
        data: dataUri,
        directUrl,
        encoded,
      }
    }
  } catch (err: any) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw createError({
        statusCode: 504,
        statusMessage: 'Gateway Timeout',
        message: 'Koneksi ke server PlantUML waktu habis (timeout setelah 10 detik). Silakan coba lagi nanti.',
      })
    }

    throw createError({
      statusCode: 502,
      statusMessage: 'Bad Gateway',
      message: `Tidak dapat terhubung ke server PlantUML (${baseUrl}). Pastikan koneksi internet aktif atau server PlantUML berjalan.`,
    })
  }
})
