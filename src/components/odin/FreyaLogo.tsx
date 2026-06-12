// @section: freya-logo — 헤더·브랜딩용 앱 아이콘
import { APP_NAME } from '@/lib/appBrand'
import { AI_PALETTE } from '@/lib/odinTheme'

interface Props {
  size?: number
  className?: string
}

export default function FreyaLogo({ size = 28, className = '' }: Props) {
  return (
    <span
      className={`inline-flex flex-shrink-0 rounded-[8px] overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 12px ${AI_PALETTE.cyan}22, 0 0 0 1px rgba(255,255,255,0.08)`,
      }}
      title={APP_NAME}
      aria-label={APP_NAME}
      role="img"
    >
      <img
        src={`${import.meta.env.BASE_URL}favicon.svg`}
        alt=""
        width={size}
        height={size}
        className="w-full h-full object-cover"
        draggable={false}
      />
    </span>
  )
}
