// @section: chat-date — 대화 일자 키 (Asia/Seoul)

const TZ = 'Asia/Seoul'

/** YYYY-MM-DD (한국 기준) */
export function getDateKey(date: Date = new Date()): string {
  return date.toLocaleDateString('en-CA', { timeZone: TZ })
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}
