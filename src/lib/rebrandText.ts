// @section: rebrand-text — 오딘 → 프레이야 대화·시스템 문구 정규화

const REPLACEMENTS: [RegExp, string][] = [
  [/저는\s*오딘\s*\(\s*ODIN\s*\)/gi, '저는 프레이야(FREYA)'],
  [/저는\s*오딘입니다/gi, '저는 프레이야입니다'],
  [/저는\s*ODIN입니다/gi, '저는 FREYA입니다'],
  [/오딘\s*\(\s*ODIN\s*\)/gi, '프레이야(FREYA)'],
  [/실제\s*오딘\s*AI/gi, '실제 프레이야 AI'],
  [/오딘\s*AI/gi, '프레이야 AI'],
  [/오딘\s*사령탑/gi, '프레이야 마차'],
  [/오딘\s*시스템/gi, '프레이야 시스템'],
  [/오딘이\s*깨어났습니다/gi, '프레이야가 깨어났습니다'],
  [/오딘이/gi, '프레이야가'],
  [/오딘을/gi, '프레이야를'],
  [/오딘에게/gi, '프레이야에게'],
  [/오딘아/gi, '프레이야'],
  [/["']오딘["']/g, '"프레이야"'],
  [/\[ ODIN v3\.0/gi, '[ FREYA v1.0'],
  [/\[ ODIN —/gi, '[ 프레이야 —'],
  [/\[ ODIN\b/gi, '[ FREYA'],
  [/ODIN ONLINE/gi, 'FREYA ONLINE'],
  [/INITIALIZING ODIN/gi, 'INITIALIZING FREYA'],
  [/\bODIN\b/g, 'FREYA'],
  [/오딘/g, '프레이야'],
]

/** 채팅·시스템 메시지에서 레거시 오딘 브랜딩을 프레이야로 치환 */
export function rebrandChatContent(text: string): string {
  if (!text || (!text.includes('오딘') && !/ODIN/i.test(text))) return text
  let out = text
  for (const [pattern, replacement] of REPLACEMENTS) {
    out = out.replace(pattern, replacement)
  }
  return out
}
