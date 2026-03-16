import {
  Moon,
  Star,
  Clock,
  Activity,
  HeartPulse,
  FileText,
  Download,
  PauseCircle,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  ModuleDialogBase,
  ScoreCircle,
  MetricCard,
  TrendChartSection,
  InsightsCard,
} from "./ModuleDialogBase";
import {
  generateHybridMockReading,
  loadSleepTrainingRows,
  type SleepReading,
  type SleepTrainingRow,
} from "../../lib/sleepData";
import { getSleepQualityModel } from "../../lib/sleepQualityModel";

interface SleepActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEnabled: boolean;
  currentScore: number;
  onToggle: () => void;
  onScoreUpdate?: (payload: SleepScoreUpdate) => void;
}

export interface SleepScoreUpdate {
  predictedScore: number;
  confidence: number;
  reading: SleepReading;
}

export function SleepActivityDialog({
  open,
  onOpenChange,
  isEnabled,
  currentScore,
  onToggle,
  onScoreUpdate,
}: SleepActivityDialogProps) {
  const [trainingRows, setTrainingRows] = useState<SleepTrainingRow[]>([]);
  const [modelStatus, setModelStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [modelError, setModelError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reading, setReading] = useState<SleepReading>({
    heartRateBpm: 61,
    timeAsleepHours: 6.9,
    movementsPerHour: 49,
  });
  const [score, setScore] = useState(currentScore);
  const [confidence, setConfidence] = useState(0.84);
  const [aiSummary, setAiSummary] = useState(
    "Generate a mock wearable reading to run the local sleep model and score tonight's recovery quality."
  );
  const [sleepQualityData, setSleepQualityData] = useState([
    { day: "Mon", value: 78 },
    { day: "Tue", value: 74 },
    { day: "Wed", value: 65 },
    { day: "Thu", value: 70 },
    { day: "Fri", value: 61 },
    { day: "Sat", value: 68 },
    { day: "Sun", value: 72 },
  ]);

  useEffect(() => {
    if (!open || modelStatus !== "idle") {
      return;
    }

    const bootstrapModel = async () => {
      setModelStatus("loading");
      setModelError(null);
      try {
        const [rows] = await Promise.all([
          loadSleepTrainingRows(),
          getSleepQualityModel(),
        ]);
        setTrainingRows(rows);
        setModelStatus("ready");
      } catch (error) {
        setModelStatus("error");
        setModelError(
          error instanceof Error
            ? error.message
            : "Unable to initialize sleep quality model"
        );
      }
    };

    bootstrapModel();
  }, [open, modelStatus]);

  useEffect(() => {
    setScore(currentScore);
  }, [currentScore]);

  const qualityLabel = useMemo(() => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 55) return "Fair";
    return "Low";
  }, [score]);

  const scoreBadgeClass = useMemo(() => {
    if (score >= 85) {
      return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
    }
    if (score >= 70) {
      return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100";
    }
    if (score >= 55) {
      return "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100";
    }
    return "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100";
  }, [score]);

  const canGenerate = isEnabled && modelStatus === "ready" && !isGenerating;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    try {
      const model = await getSleepQualityModel();
      const nextReading = generateHybridMockReading(trainingRows);
      const prediction = model.predict(nextReading);

      setReading(nextReading);
      setScore(prediction.score);
      setConfidence(prediction.confidence);
      setAiSummary(prediction.explanation);
      setSleepQualityData((prev) => {
        const next = [
          ...prev,
          {
            day: new Date().toLocaleDateString("en-US", { weekday: "short" }),
            value: prediction.score,
          },
        ];
        return next.slice(-7);
      });

      onScoreUpdate?.({
        predictedScore: prediction.score,
        confidence: prediction.confidence,
        reading: nextReading,
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
      headerAction={{
        label: "Connect to Wearable",
      }}
      footerActions={[
        {
          label: isGenerating ? "Generating..." : "Generate Mock Reading",
          icon: Star,
          onClick: handleGenerate,
        },
        { label: "View Sleep Logs", icon: FileText },
        { label: "Export Report", icon: Download },
        { label: "Pause Tracking", icon: PauseCircle },
        { label: "Delete Activity Data", icon: Trash2, danger: true },
      ]}
    >
      <Card className="bg-white p-4 shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Mock Sleep Input Generator</h3>
            <p className="mt-1 text-xs text-gray-500">
              Hybrid mode samples a real CSV row and applies jitter before model inference.
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              Training rows: {trainingRows.length || "..."} | Confidence: {Math.round(confidence * 100)}%
            </p>
            {modelStatus === "error" && (
              <p className="mt-1 text-[11px] text-rose-600">{modelError}</p>
            )}
          </div>
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {modelStatus === "loading"
              ? "Training Model..."
              : isEnabled
                ? isGenerating
                  ? "Generating..."
                  : "Generate Mock Reading"
                : "Tracking Paused"}
          </Button>
        </div>
      </Card>

      {/* ── Score Summary ───────────────────────────── */}
      <Card className="bg-white p-5 shadow-none">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <ScoreCircle score={score} color="#4f46e5" label={qualityLabel} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-base font-semibold text-gray-900">
                Sleep &amp; Activity Score
              </h3>
              <Badge className={`${scoreBadgeClass} text-xs`}>
                {qualityLabel} Recovery Night
              </Badge>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              {aiSummary}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {[
                {
                  label: "Predicted",
                  val: `${score} / 100`,
                  color: "text-indigo-600",
                },
                {
                  label: "Asleep",
                  val: `${reading.timeAsleepHours.toFixed(1)} hrs`,
                  color: "text-blue-600",
                },
                {
                  label: "Heart Rate",
                  val: `${reading.heartRateBpm} bpm`,
                  color: "text-violet-600",
                },
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
            label: "Predicted Quality",
            value: `${score}`,
            unit: "/ 100",
            icon: Star,
            trend: score >= 70 ? "up" : "down",
            trendLabel: qualityLabel,
            accentClass: "border-l-indigo-400",
            iconBg: "bg-indigo-50",
            iconColor: "text-indigo-600",
            statusBadge: {
              text: qualityLabel,
              className:
                score >= 70
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : "bg-amber-100 text-amber-700 border-amber-200",
            },
          }}
        />
        <MetricCard
          metric={{
            label: "Time Asleep",
            value: `${reading.timeAsleepHours.toFixed(1)}`,
            unit: "hrs",
            icon: Clock,
            trend: reading.timeAsleepHours >= 7 ? "up" : "down",
            trendLabel:
              reading.timeAsleepHours >= 7 ? "At or above 7-hr target" : "Below 7-hr target",
            accentClass: "border-l-blue-400",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
          }}
        />
        <MetricCard
          metric={{
            label: "Heart Rate",
            value: `${reading.heartRateBpm}`,
            unit: "bpm",
            icon: HeartPulse,
            trend:
              reading.heartRateBpm >= 52 && reading.heartRateBpm <= 68
                ? "stable"
                : "down",
            trendLabel:
              reading.heartRateBpm >= 52 && reading.heartRateBpm <= 68
                ? "Within resting target"
                : "Outside resting target",
            accentClass: "border-l-violet-400",
            iconBg: "bg-violet-50",
            iconColor: "text-violet-600",
            statusBadge: {
              text:
                reading.heartRateBpm >= 52 && reading.heartRateBpm <= 68
                  ? "Optimal"
                  : "Elevated",
              className:
                reading.heartRateBpm >= 52 && reading.heartRateBpm <= 68
                  ? "bg-violet-100 text-violet-700 border-violet-200"
                  : "bg-amber-100 text-amber-700 border-amber-200",
            },
          }}
        />
        <MetricCard
          metric={{
            label: "Movements / Hr",
            value: `${reading.movementsPerHour.toFixed(1)}`,
            icon: Activity,
            trend: reading.movementsPerHour <= 55 ? "up" : "down",
            trendLabel:
              reading.movementsPerHour <= 55
                ? "Stable overnight movement"
                : "High restlessness detected",
            accentClass: "border-l-rose-300",
            iconBg: "bg-rose-50",
            iconColor: "text-rose-500",
            statusBadge: {
              text: reading.movementsPerHour <= 55 ? "Calm" : "Restless",
              className:
                reading.movementsPerHour <= 55
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-rose-100 text-rose-600 border-rose-200",
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
            text: `Model confidence is ${Math.round(confidence * 100)}% for this generated wearable profile.`,
          },
          {
            text:
              reading.timeAsleepHours >= 7
                ? "Time asleep is meeting baseline sleep duration targets."
                : "Time asleep is under target; extending sleep by ~45 minutes should improve recovery score.",
          },
          {
            text:
              reading.movementsPerHour > 55
                ? "Elevated overnight movement is the strongest drag on tonight's predicted quality."
                : "Lower overnight movement supports better deep sleep continuity.",
          },
        ]}
      />
    </ModuleDialogBase>
  );
}
