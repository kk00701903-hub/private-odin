// @section: settings-view — 설정 탭 (그룹형 iOS 스타일)
import { motion } from 'framer-motion'
import { Volume2, VolumeX, Moon, Sun } from 'lucide-react'
import { useSpeechStore } from '@/store/useSpeechStore'
import { useOdinWakeStore } from '@/store/useOdinWakeStore'
import { useOdinSettingsStore } from '@/store/useOdinSettingsStore'
import { rescheduleIdleSleepTimer } from '@/store/useOdinWakeStore'
import { formatStandbyLabel, formatTypingLabel } from '@/lib/odinAssistantSpeed'
import { AI_PALETTE } from '@/lib/odinTheme'
import { APP_NAME, APP_NAME_EN, AI_NAME } from '@/lib/appBrand'
import {
  SettingsGroup,
  SettingsRow,
  SettingsSliderRow,
  SettingsToggle,
} from '@/components/odin/settings/SettingsUi'
import { SettingsManualGroup } from '@/components/odin/settings/SettingsManual'
import { SettingsSubAgentsGroup } from '@/components/odin/settings/SettingsSubAgents'
import { SettingsNasWakeRow } from '@/components/odin/settings/SettingsNasWake'

const CYAN = AI_PALETTE.cyan
const VIOLET = AI_PALETTE.violet

export default function SettingsView() {
  const isMuted = useSpeechStore((s) => s.isMuted)
  const toggleMute = useSpeechStore((s) => s.toggleMute)
  const isAwake = useOdinWakeStore((s) => s.isAwake)
  const sleep = useOdinWakeStore((s) => s.sleep)
  const wakeUp = useOdinWakeStore((s) => s.wakeUp)

  const standbyLevel = useOdinSettingsStore((s) => s.standbySpeedLevel)
  const typingLevel = useOdinSettingsStore((s) => s.typingSpeedLevel)
  const idleMinutes = useOdinSettingsStore((s) => s.idleTimeoutMinutes)
  const setStandby = useOdinSettingsStore((s) => s.setStandbySpeedLevel)
  const setTyping = useOdinSettingsStore((s) => s.setTypingSpeedLevel)
  const setIdleMinutes = useOdinSettingsStore((s) => s.setIdleTimeoutMinutes)

  const handleIdleChange = (v: number) => {
    setIdleMinutes(v)
    rescheduleIdleSleepTimer()
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-none">
      <div className="px-4 pt-3 pb-8 flex flex-col gap-5 max-w-lg mx-auto w-full">

        <header className="px-1 pb-1">
          <h1 className="text-[22px] font-sans font-semibold text-white/90 tracking-tight">설정</h1>
          <p className="text-[14px] font-sans text-white/35 mt-0.5">{APP_NAME} 시스템 환경</p>
        </header>

        <SettingsGroup title="일반">
          <SettingsRow
            label="음성 출력"
            hint="AI 답변 TTS 재생"
            icon={
              isMuted
                ? <VolumeX className="w-5 h-5 text-white/35" />
                : <Volume2 className="w-5 h-5" style={{ color: CYAN }} />
            }
            trailing={<SettingsToggle on={!isMuted} onToggle={toggleMute} accent={CYAN} />}
          />
          <SettingsRow
            label="프레이야 상태"
            hint={isAwake ? '명령 대기 중' : '절전 모드'}
            value={isAwake ? '온라인' : '슬립'}
            icon={
              isAwake
                ? <Sun className="w-5 h-5" style={{ color: CYAN }} />
                : <Moon className="w-5 h-5 text-white/35" />
            }
            trailing={
              <button
                type="button"
                onClick={isAwake ? sleep : () => wakeUp('button')}
                className="text-[14px] font-sans font-medium px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors"
                style={
                  isAwake
                    ? { background: `${VIOLET}18`, color: VIOLET }
                    : { background: `${CYAN}18`, color: CYAN }
                }
              >
                {isAwake ? '슬립' : '깨우기'}
              </button>
            }
          />
        </SettingsGroup>

        <SettingsGroup
          title="어시스턴트"
          footer="대기 속도는 홀로그램 애니메이션, 말풍선 속도는 타자·음성 출력에 적용됩니다."
        >
          <SettingsSliderRow
            label="대기 속도"
            hint="응답 대기 중 인터페이스 속도"
            value={standbyLevel}
            valueLabel={formatStandbyLabel(standbyLevel)}
            onChange={setStandby}
            accent={CYAN}
          />
          <SettingsSliderRow
            label="말풍선 속도"
            hint="응답 텍스트·음성 출력 속도"
            value={typingLevel}
            valueLabel={formatTypingLabel(typingLevel)}
            onChange={setTyping}
            accent={VIOLET}
          />
          <SettingsSliderRow
            label="자동 절전"
            hint="활동 없을 때 슬립 전환"
            value={idleMinutes}
            valueLabel={`${idleMinutes}분`}
            onChange={handleIdleChange}
            accent={AI_PALETTE.amber}
            min={1}
            max={60}
            minLabel="1분"
            maxLabel="60분"
          />
        </SettingsGroup>

        <SettingsGroup title="인프라" footer="Wake-on-LAN으로 원격 PC를 켭니다.">
          <SettingsNasWakeRow />
        </SettingsGroup>

        <SettingsSubAgentsGroup />

        <SettingsGroup title="도움말" footer="Linux PC 배포·VM 접속·Claude Code 운영 가이드">
          <SettingsManualGroup />
        </SettingsGroup>

        <footer className="flex flex-col items-center gap-1 pt-2 pb-4 opacity-40">
          <motion.span
            className="text-[15px] font-black tracking-[0.2em]"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              background: `linear-gradient(120deg, ${CYAN}, ${VIOLET})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {APP_NAME_EN}
          </motion.span>
          <span className="text-[12px] font-sans text-white/40">{APP_NAME} v1.0.0 · {AI_NAME} AI · PWA</span>
        </footer>
      </div>
    </div>
  )
}
