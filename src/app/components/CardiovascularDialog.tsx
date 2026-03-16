import {
  Heart,
  HeartPulse,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
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

interface CardiovascularDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEnabled: boolean;
  onToggle: () => void;
}

const hrvData = [
  { day: "Mon", value: 46 },
  { day: "Tue", value: 50 },
  { day: "Wed", value: 47 },
  { day: "Thu", value: 52 },
  { day: "Fri", value: 49 },
  { day: "Sat", value: 55 },
  { day: "Sun", value: 58 },
];

export function CardiovascularDialog({
  open,
  onOpenChange,
  isEnabled,
  onToggle,
}: CardiovascularDialogProps) {
  const score = 88;

  return (
    <ModuleDialogBase
      open={open}
      onOpenChange={onOpenChange}
      icon={Heart}
      title="Cardiovascular &amp; Early Illness Detection"
      description="Resting heart rate, HRV trends, recovery scoring, and illness risk assessment"
      headerGradient="bg-gradient-to-r from-rose-600 to-red-500"
      isEnabled={isEnabled}
      onToggle={onToggle}
      privacyNote="Cardiovascular data is inferred from rPPG and motion signals. All analysis is performed locally. No health records are transmitted without explicit user authorisation."
      footerActions={[
        { label: "View Cardiac Logs", icon: FileText },
        { label: "Export Report", icon: Download },
        { label: "Pause Tracking", icon: PauseCircle },
        { label: "Delete Health Data", icon: Trash2, danger: true },
      ]}
    >
      {/* ── Score Summary ───────────────────────────── */}
      <Card className="bg-white p-5 shadow-none">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <ScoreCircle score={score} color="#e11d48" label="Strong" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-base font-semibold text-gray-900">
                Cardiovascular Health Score
              </h3>
              <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 text-xs">
                Strong Recovery
              </Badge>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Cardiovascular indicators are excellent. HRV is trending upward,
              resting heart rate is well below average, and no illness risk
              markers have been detected.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {[
                { label: "Resting HR", val: "58 bpm", color: "text-rose-600" },
                { label: "HRV", val: "58 ms ↗", color: "text-red-500" },
                { label: "Risk", val: "Low", color: "text-green-600" },
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
            label: "Resting Heart Rate",
            value: "58",
            unit: "bpm",
            icon: Heart,
            trend: "down",
            trendLabel: "Below avg — healthy",
            accentClass: "border-l-rose-400",
            iconBg: "bg-rose-50",
            iconColor: "text-rose-600",
            statusBadge: {
              text: "Optimal",
              className: "bg-green-100 text-green-700 border-green-200",
            },
          }}
        />
        <MetricCard
          metric={{
            label: "HRV Trend",
            value: "58",
            unit: "ms",
            icon: HeartPulse,
            trend: "up",
            trendLabel: "+12 ms this week",
            accentClass: "border-l-red-400",
            iconBg: "bg-red-50",
            iconColor: "text-red-500",
            statusBadge: {
              text: "Improving",
              className: "bg-green-100 text-green-700 border-green-200",
            },
          }}
        />
        <MetricCard
          metric={{
            label: "Recovery Score",
            value: "91",
            unit: "/ 100",
            icon: ShieldCheck,
            trend: "up",
            trendLabel: "Excellent recovery",
            accentClass: "border-l-emerald-400",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            statusBadge: {
              text: "Excellent",
              className: "bg-emerald-100 text-emerald-700 border-emerald-200",
            },
          }}
        />
        <MetricCard
          metric={{
            label: "Illness Risk Flag",
            value: "Low",
            icon: AlertTriangle,
            trend: "stable",
            trendLabel: "No markers detected",
            accentClass: "border-l-green-400",
            iconBg: "bg-green-50",
            iconColor: "text-green-600",
            statusBadge: {
              text: "Clear",
              className: "bg-green-100 text-green-700 border-green-200",
            },
          }}
        />
      </div>

      {/* ── Trend Chart ─────────────────────────────── */}
      <TrendChartSection
        data={hrvData}
        title="7-Day HRV Trend"
        chartColor="#e11d48"
        yLabel="ms"
        yDomain={[35, 65]}
      />

      {/* ── AI Insights ─────────────────────────────── */}
      <InsightsCard
        accentBg="bg-rose-50"
        accentBorder="border-rose-100"
        accentTitle="text-rose-700"
        bulletColor="bg-rose-400"
        insights={[
          {
            text: "HRV has increased by 12 ms over the past 7 days — a strong indicator of improved autonomic nervous system balance.",
          },
          {
            text: "Resting heart rate of 58 bpm is below the 60–100 bpm clinical range, reflecting good cardiovascular fitness.",
          },
          {
            text: "No early illness markers (elevated resting HR, HRV drop, or autonomic dysregulation) detected in the current session.",
          },
        ]}
      />
    </ModuleDialogBase>
  );
}
