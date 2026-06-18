// @section: server-check-reports — QUEUE 업무 탭 · 매일 09:00 서버 점검 레포트
import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  Download,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  Server,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  downloadServerCheckReport,
  fetchServerCheckReportText,
  getServerCheckReportFileUrl,
} from '@/api/serverCheckReports'
import { useServerCheckReports } from '@/hooks/useServerCheckReports'
import { AI_PALETTE } from '@/lib/odinTheme'
import type { ServerCheckReport } from '@/types/serverCheckReport'

const CYAN = AI_PALETTE.cyan
const AMBER = AI_PALETTE.amber

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function ReportFileRow({
  report,
  onOpen,
}: {
  report: ServerCheckReport
  onOpen: (report: ServerCheckReport) => void
}) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await downloadServerCheckReport(report.id, report.filename)
    } finally {
      setDownloading(false)
    }
  }

  const handleOpenTab = () => {
    window.open(getServerCheckReportFileUrl(report.id, false), '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="flex items-center gap-2.5 px-2.5 py-2 rounded-[12px] group"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
        style={{ background: `${CYAN}12`, border: `1px solid ${CYAN}28` }}
      >
        <FileText className="w-4 h-4" style={{ color: CYAN }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-mono font-semibold text-white/80 truncate">
          {report.filename}
        </p>
        <p className="text-[11px] font-mono text-white/30 truncate">
          {report.date}
          {' · '}
          {format(parseISO(report.generatedAt), 'M/d HH:mm', { locale: ko })}
          {' · '}
          {formatBytes(report.sizeBytes)}
        </p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={() => onOpen(report)}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: `${CYAN}12`, border: `1px solid ${CYAN}30` }}
          title="열기"
        >
          <FileText className="w-3.5 h-3.5" style={{ color: CYAN }} />
        </button>
        <button
          type="button"
          onClick={handleOpenTab}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors opacity-70 group-hover:opacity-100"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)' }}
          title="새 탭에서 열기"
        >
          <ExternalLink className="w-3.5 h-3.5 text-white/45" />
        </button>
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={downloading}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-40"
          style={{ background: `${AMBER}12`, border: `1px solid ${AMBER}30` }}
          title="다운로드"
        >
          {downloading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: AMBER }} />
            : <Download className="w-3.5 h-3.5" style={{ color: AMBER }} />
          }
        </button>
      </div>
    </div>
  )
}

export default function ServerCheckReportsPanel() {
  const { reports, schedule, fromServer, loading, refresh } = useServerCheckReports()
  const [preview, setPreview] = useState<ServerCheckReport | null>(null)
  const [previewText, setPreviewText] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const openPreview = async (report: ServerCheckReport) => {
    setPreview(report)
    setPreviewText(null)
    setPreviewLoading(true)
    const text = await fetchServerCheckReportText(report.id)
    setPreviewText(text)
    setPreviewLoading(false)
  }

  const closePreview = () => {
    setPreview(null)
    setPreviewText(null)
  }

  return (
    <>
      <div
        className="mx-3 mt-1 mb-2 rounded-[16px] overflow-hidden flex-shrink-0"
        style={{
          background: 'rgba(10, 12, 22, 0.75)',
          border: `1px solid ${CYAN}22`,
          boxShadow: `0 0 16px ${CYAN}06`,
        }}
      >
        <div
          className="flex items-center justify-between gap-2 px-3 py-2.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Server className="w-4 h-4 flex-shrink-0" style={{ color: CYAN }} />
            <div className="min-w-0">
              <p className="text-[14px] font-sans font-semibold text-white/85">서버 점검 레포트</p>
              <p className="text-[11px] font-mono text-white/30">
                매일 {schedule} · 운영팀장
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: fromServer ? AI_PALETTE.emerald : 'rgba(255,255,255,0.25)',
                boxShadow: fromServer ? `0 0 6px ${AI_PALETTE.emerald}` : undefined,
              }}
              title={fromServer ? '서버 연동' : '오프라인'}
            />
            <button
              type="button"
              onClick={() => void refresh()}
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
              title="새로고침"
            >
              {loading
                ? <Loader2 className="w-3.5 h-3.5 text-white/35 animate-spin" />
                : <RefreshCw className="w-3.5 h-3.5 text-white/35" />
              }
            </button>
          </div>
        </div>

        <div className="px-3 py-2.5 flex flex-col gap-2 max-h-[220px] overflow-y-auto scrollbar-none">
          {loading && reports.length === 0 ? (
            <p className="text-[12px] font-mono text-white/28 text-center py-3">불러오는 중…</p>
          ) : !fromServer ? (
            <p className="text-[12px] font-sans text-white/30 text-center py-3 px-2 leading-relaxed">
              VITE_ODIN_API_URL 연결 후 매일 {schedule}에 생성된 점검 파일이 표시됩니다.
            </p>
          ) : reports.length === 0 ? (
            <p className="text-[12px] font-mono text-white/28 text-center py-3">
              아직 수신된 레포트 없음
            </p>
          ) : (
            reports.map((r) => (
              <ReportFileRow key={`${r.id}-${r.filename}`} report={r} onOpen={openPreview} />
            ))
          )}
        </div>
      </div>

      <Dialog open={preview != null} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-w-[min(100vw-2rem,42rem)] max-h-[85vh] flex flex-col gap-3 bg-[#0c0e18] border-white/10">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm text-white/85 truncate pr-6">
              {preview?.filename}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-3">
            {previewLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-white/35" />
              </div>
            ) : previewText == null ? (
              <p className="text-sm text-red-400/80">파일을 불러오지 못했습니다.</p>
            ) : (
              <pre className="text-[13px] font-sans text-white/75 whitespace-pre-wrap leading-relaxed">
                {previewText}
              </pre>
            )}
          </div>
          {preview && (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.open(getServerCheckReportFileUrl(preview.id, false), '_blank')}
                className="px-3 py-1.5 rounded-lg text-[12px] font-mono border border-white/15 text-white/55 hover:text-white/80"
              >
                새 탭
              </button>
              <button
                type="button"
                onClick={() => void downloadServerCheckReport(preview.id, preview.filename)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-mono font-semibold"
                style={{ background: `${AMBER}20`, border: `1px solid ${AMBER}40`, color: AMBER }}
              >
                다운로드
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
