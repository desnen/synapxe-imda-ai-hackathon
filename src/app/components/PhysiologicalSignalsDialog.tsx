import {
  Activity,
  Heart,
  Wind,
  BatteryMedium,
  Signal,
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

interface PhysiologicalSignalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEnabled: boolean;
  onToggle: () => void;
}

const heartRateData = [
  { day: "Mon", value: 74 },
  { day: "Tue", value: 71 },
  { day: "Wed", value: 76 },
  { day: "Thu", value: 72 },
  { day: "Fri", value: 69 },
  { day: "Sat", value: 73 },
  { day: "Sun", value: 72 },
];

export function PhysiologicalSignalsDialog({
  open,
  onOpenChange,
  isEnabled,
  onToggle,
}: PhysiologicalSignalsDialogProps) {
  const score = 85;

  return (
    <ModuleDialogBase
      open={open}
      onOpenChange={onOpenChange}
      icon={Activity}
      title="Physiological Signals"
      description="Continuous monitoring of heart rate, respiration, fatigue, and signal quality"
      headerGradient="bg-gradient-to-r from-teal-600 to-cyan-600"
      isEnabled={isEnabled}
      onToggle={onToggle}
      privacyNote="Physiological readings are derived from camera-based rPPG. Raw signal data is processed locally and never stored beyond the current session without consent."
      footerActions={[
        { label: "View Session Logs", icon: FileText },
        { label: "Export Report", icon: Download },
        { label: "Pause Tracking", icon: PauseCircle },
        { label: "Delete Signal Data", icon: Trash2, danger: true },
      ]}
    >
      {/* ── Score Summary ───────────────────────────── */}
      <Card className="bg-white p-5 shadow-none">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <ScoreCircle score={score} color="#0d9488" label="Stable" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-base font-semibold text-gray-900">
                Physiological Health Score
              </h3>
              <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 text-xs">
                Stable &amp; Improving
              </Badge>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your physiological signals are within healthy ranges. Heart rate
              variability is trending upward and respiration remains steady.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {[
                { label: "Heart Rate", val: "72 bpm", color: "text-teal-600" },
                { label: "Respiration", val: "16 br/min", color: "text-cyan-600" },
                { label: "Confidence", val: "94%", color: "text-green-600" },
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
            label: "Heart Rate",
            value: "72",
            unit: "bpm",
            icon: Heart,
            trend: "stable",
            trendLabel: "Within normal range",
            accentClass: "border-l-teal-400",
            iconBg: "bg-teal-50",
            iconColor: "text-teal-600",
          }}
        />
        <MetricCard
          metric={{
            label: "Respiration",
            value: "16",
            unit: "br/min",
            icon: Wind,
            trend: "stable",
            trendLabel: "Relaxed breathing",
            accentClass: "border-l-cyan-400",
            iconBg: "bg-cyan-50",
            iconColor: "text-cyan-600",
          }}
        />
        <MetricCard
          metric={{
            label: "Fatigue Index",
            value: "2.1",
            unit: "/ 10",
            icon: BatteryMedium,
            trend: "up",
            trendLabel: "Low fatigue detected",
            accentClass: "border-l-emerald-400",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            statusBadge: {
              text: "Low",
              className: "bg-green-100 text-green-700 border-green-200",
            },
          }}
        />
        <MetricCard
          metric={{
            label: "Signal Confidence",
            value: "94",
            unit: "%",
            icon: Signal,
            trend: "up",
            trendLabel: "High quality signal",
            accentClass: "border-l-sky-400",
            iconBg: "bg-sky-50",
            iconColor: "text-sky-600",
            statusBadge: {
              text: "High",
              className: "bg-sky-100 text-sky-700 border-sky-200",
            },
          }}
        />
      </div>

      {/* ── Trend Chart ─────────────────────────────── */}
      <TrendChartSection
        data={heartRateData}
        title="7-Day Heart Rate Trend"
        chartColor="#0d9488"
        yLabel="bpm"
        yDomain={[60, 85]}
      />

      {/* ── AI Insights ─────────────────────────────── */}
      <InsightsCard
        accentBg="bg-teal-50"
        accentBorder="border-teal-100"
        accentTitle="text-teal-700"
        bulletColor="bg-teal-400"
        insights={[
          {
            text: "Resting heart rate has decreased by 3 bpm over the last week, indicating improved cardiovascular efficiency.",
          },
          {
            text: "Respiration rate remains in the ideal 12–20 br/min range, consistent with a calm physiological state.",
          },
          {
            text: "Signal confidence above 90% ensures the accuracy of remote PPG-derived metrics for this session.",
          },
        ]}
      />
    </ModuleDialogBase>
  );
}
