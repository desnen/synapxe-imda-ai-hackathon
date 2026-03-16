import {
  Moon,
  Star,
  Clock,
  Flame,
  Volume2,
  FileText,
  Download,
  PauseCircle,
  Trash2,
} from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  ModuleDialogBase,
  ScoreCircle,
  MetricCard,
  TrendChartSection,
  InsightsCard,
} from "./ModuleDialogBase";

interface SleepActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEnabled: boolean;
  onToggle: () => void;
}

const sleepQualityData = [
  { day: "Mon", value: 78 },
  { day: "Tue", value: 74 },
  { day: "Wed", value: 65 },
  { day: "Thu", value: 70 },
  { day: "Fri", value: 61 },
  { day: "Sat", value: 68 },
  { day: "Sun", value: 72 },
];

export function SleepActivityDialog({
  open,
  onOpenChange,
  isEnabled,
  onToggle,
}: SleepActivityDialogProps) {
  const score = 72;

  return (
    <ModuleDialogBase
      open={open}
      onOpenChange={onOpenChange}
      icon={Moon}
      title="Sleep &amp; Activity"
      description="Sleep quality, duration, activity levels, and environmental disruption tracking"
      headerGradient="bg-gradient-to-r from-indigo-600 to-blue-600"
      isEnabled={isEnabled}
      onToggle={onToggle}
      privacyNote="Sleep and activity data is captured passively via microphone amplitude and motion sensors. No audio recordings are stored. All data remains on-device."
      footerActions={[
        { label: "View Sleep Logs", icon: FileText },
        { label: "Export Report", icon: Download },
        { label: "Pause Tracking", icon: PauseCircle },
        { label: "Delete Activity Data", icon: Trash2, danger: true },
      ]}
    >
      {/* ── Score Summary ───────────────────────────── */}
      <Card className="bg-white p-5 shadow-none">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <ScoreCircle score={score} color="#4f46e5" label="Below Avg" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-base font-semibold text-gray-900">
                Sleep &amp; Activity Score
              </h3>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 text-xs">
                Below Weekly Average
              </Badge>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Sleep quality is slightly below your 7-day average. Noise
              disruption events and reduced sleep duration are the primary
              contributing factors.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {[
                { label: "Quality", val: "68 / 100", color: "text-indigo-600" },
                { label: "Duration", val: "6.2 hrs", color: "text-blue-600" },
                { label: "Activity", val: "Moderate", color: "text-violet-600" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className={`text-sm font-semibold ${s.color}`}>
                    {s.val}
                  </span>
                  <span className="text-xs text-gray-400">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Metric Cards ────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          metric={{
            label: "Sleep Quality",
            value: "68",
            unit: "/ 100",
            icon: Star,
            trend: "down",
            trendLabel: "–5 from last week",
            accentClass: "border-l-indigo-400",
            iconBg: "bg-indigo-50",
            iconColor: "text-indigo-600",
            statusBadge: {
              text: "Fair",
              className: "bg-amber-100 text-amber-700 border-amber-200",
            },
          }}
        />
        <MetricCard
          metric={{
            label: "Sleep Duration",
            value: "6.2",
            unit: "hrs",
            icon: Clock,
            trend: "down",
            trendLabel: "Below 7-hr target",
            accentClass: "border-l-blue-400",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
          }}
        />
        <MetricCard
          metric={{
            label: "Activity Level",
            value: "Mod",
            icon: Flame,
            trend: "stable",
            trendLabel: "7,240 steps today",
            accentClass: "border-l-violet-400",
            iconBg: "bg-violet-50",
            iconColor: "text-violet-600",
            statusBadge: {
              text: "Moderate",
              className: "bg-violet-100 text-violet-700 border-violet-200",
            },
          }}
        />
        <MetricCard
          metric={{
            label: "Noise Disruptions",
            value: "3",
            unit: "events",
            icon: Volume2,
            trend: "up",
            trendLabel: "During sleep window",
            accentClass: "border-l-rose-300",
            iconBg: "bg-rose-50",
            iconColor: "text-rose-500",
            statusBadge: {
              text: "Notable",
              className: "bg-rose-100 text-rose-600 border-rose-200",
            },
          }}
        />
      </div>

      {/* ── Trend Chart ─────────────────────────────── */}
      <TrendChartSection
        data={sleepQualityData}
        title="7-Day Sleep Quality Trend"
        chartColor="#4f46e5"
        yLabel="Score"
        yDomain={[50, 90]}
      />

      {/* ── AI Insights ─────────────────────────────── */}
      <InsightsCard
        accentBg="bg-indigo-50"
        accentBorder="border-indigo-100"
        accentTitle="text-indigo-700"
        bulletColor="bg-indigo-400"
        insights={[
          {
            text: "Sleep duration has averaged 6.2 hrs over the past week — 48 minutes below the recommended 7-hr minimum.",
          },
          {
            text: "Three noise disruption events were detected during deep sleep phases, likely contributing to reduced recovery quality.",
          },
          {
            text: "Moderate daily activity levels are positive; increasing step count by ~2,000 steps may improve sleep onset.",
          },
        ]}
      />
    </ModuleDialogBase>
  );
}
