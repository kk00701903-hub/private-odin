// @section: news-widgets-grid
import { BarChart2, Dumbbell, Newspaper, Swords, Timer, TrendingUp, TrendingDown } from 'lucide-react'
import {
  ECONOMY_NEWS, SPORTS_NEWS, STOCKS_NEWS, MMA_NEWS, MARATHON_NEWS,
  STOCK_QUOTES, NewsItem, StockQuote
} from '@/data/dummyData'

/* ── 태그 컬러 맵 ── */
const TAG_COLOR: Record<string, string> = {
  cyan:   'border-primary/60 text-primary bg-primary/10',
  amber:  'border-accent/60 text-accent bg-accent/10',
  green:  'border-chart-3/60 text-chart-3 bg-chart-3/10',
  red:    'border-destructive/60 text-destructive bg-destructive/10',
  purple: 'border-chart-4/60 text-chart-4 bg-chart-4/10',
}

/* ── 개별 뉴스 아이템 ── */
function NewsRow({ item }: { item: NewsItem }) {
  return (
    <li className="group flex flex-col gap-0.5 py-1.5 border-b border-border/30 last:border-0 cursor-pointer hover:bg-muted/20 rounded px-1 -mx-1 transition-colors">
      <div className="flex items-start gap-1.5">
        {item.tag && (
          <span className={`mt-0.5 inline-flex px-1.5 py-0 text-[9px] font-mono font-semibold rounded border flex-shrink-0 ${TAG_COLOR[item.tagColor ?? 'cyan']}`}>
            {item.tag}
          </span>
        )}
        <p className="text-xs text-foreground/85 leading-snug group-hover:text-foreground transition-colors line-clamp-2">
          {item.title}
        </p>
      </div>
      <div className="flex items-center gap-1.5 pl-0.5">
        <span className="text-[10px] text-muted-foreground">{item.source}</span>
        <span className="text-[10px] text-muted-foreground/50">•</span>
        <span className="text-[10px] text-muted-foreground/70 font-mono">{item.time}</span>
      </div>
    </li>
  )
}

/* ── 주식 티커 행 ── */
function StockRow({ q }: { q: StockQuote }) {
  const up = q.change >= 0
  return (
    <div className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
      <div>
        <p className="text-xs font-semibold text-foreground/90 font-mono">{q.name}</p>
        <p className="text-[10px] text-muted-foreground font-mono">{q.ticker}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold font-mono text-foreground">{q.price.toLocaleString()}원</p>
        <div className={`flex items-center justify-end gap-0.5 ${up ? 'text-chart-3' : 'text-destructive'}`}>
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span className="text-[10px] font-mono font-semibold">
            {up ? '+' : ''}{q.change.toLocaleString()} ({up ? '+' : ''}{q.changePct.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── 위젯 카드 공통 ── */
function WidgetCard({
  icon: Icon,
  title,
  accentColor = 'primary',
  children,
  className = '',
}: {
  icon: React.FC<{ className?: string }>
  title: string
  accentColor?: 'primary' | 'accent' | 'chart-3' | 'destructive' | 'chart-4'
  children: React.ReactNode
  className?: string
}) {
  const headerColor: Record<string, string> = {
    primary:     'text-primary border-primary/30',
    accent:      'text-accent border-accent/30',
    'chart-3':   'text-chart-3 border-chart-3/30',
    destructive: 'text-destructive border-destructive/30',
    'chart-4':   'text-chart-4 border-chart-4/30',
  }
  const glowColor: Record<string, string> = {
    primary:     'color-mix(in srgb, var(--primary) 12%, transparent)',
    accent:      'color-mix(in srgb, var(--accent) 12%, transparent)',
    'chart-3':   'color-mix(in srgb, var(--chart-3) 12%, transparent)',
    destructive: 'color-mix(in srgb, var(--destructive) 12%, transparent)',
    'chart-4':   'color-mix(in srgb, var(--chart-4) 12%, transparent)',
  }

  return (
    <div
      className={`flex flex-col rounded-lg border border-border bg-card overflow-hidden ${className}`}
      style={{ boxShadow: `0 0 16px -4px ${glowColor[accentColor]}` }}
    >
      {/* 카드 헤더 */}
      <div className={`flex items-center gap-2 px-3 py-2 border-b bg-muted/20 ${headerColor[accentColor]}`}>
        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-[10px] font-mono font-semibold uppercase tracking-widest">{title}</span>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
      </div>
      {/* 카드 바디 */}
      <div className="flex-1 overflow-y-auto px-3 py-1 scrollbar-thin">
        {children}
      </div>
    </div>
  )
}

/* ── 5개 뉴스 위젯 그리드 ── */
export default function NewsWidgetsGrid() {
  return (
    <div className="h-full grid grid-cols-5 gap-2">
      {/* 1. 경제 */}
      <WidgetCard icon={Newspaper} title="경제" accentColor="primary">
        <ul className="space-y-0">
          {ECONOMY_NEWS.map((n) => <NewsRow key={n.id} item={n} />)}
        </ul>
      </WidgetCard>

      {/* 2. 스포츠 */}
      <WidgetCard icon={Dumbbell} title="스포츠" accentColor="chart-3">
        <ul className="space-y-0">
          {SPORTS_NEWS.map((n) => <NewsRow key={n.id} item={n} />)}
        </ul>
      </WidgetCard>

      {/* 3. 주식 */}
      <WidgetCard icon={BarChart2} title="주식" accentColor="accent">
        {/* 시세 요약 */}
        <div className="mb-2 pt-1 border-b border-border/40 pb-2">
          {STOCK_QUOTES.map((q) => <StockRow key={q.ticker} q={q} />)}
        </div>
        {/* 주식 뉴스 */}
        <ul className="space-y-0">
          {STOCKS_NEWS.map((n) => <NewsRow key={n.id} item={n} />)}
        </ul>
      </WidgetCard>

      {/* 4. MMA */}
      <WidgetCard icon={Swords} title="MMA" accentColor="destructive">
        <ul className="space-y-0">
          {MMA_NEWS.map((n) => <NewsRow key={n.id} item={n} />)}
        </ul>
      </WidgetCard>

      {/* 5. 마라톤 */}
      <WidgetCard icon={Timer} title="마라톤" accentColor="chart-4">
        <ul className="space-y-0">
          {MARATHON_NEWS.map((n) => <NewsRow key={n.id} item={n} />)}
        </ul>
      </WidgetCard>
    </div>
  )
}
