import { Camera, ImageIcon, Download, PauseCircle, Trash2, Eye, Zap } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  ModuleDialogBase,
  InsightsCard,
} from "./ModuleDialogBase";

interface VisualSignalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEnabled: boolean;
  onToggle: () => void;
}

export function VisualSignalsDialog({
  open,
  onOpenChange,
  isEnabled,
  onToggle,
}: VisualSignalsDialogProps) {
  return (
    <ModuleDialogBase
      open={open}
      onOpenChange={onOpenChange}
      icon={Eye}
      title="Visual Signals"
      description="Real-time facial analysis for emotion, rPPG, and stress detection"
      headerGradient="bg-gradient-to-r from-purple-600 to-violet-700"
      isEnabled={isEnabled}
      onToggle={onToggle}
      privacyNote="Camera data is processed locally in real-time. No video is stored or transmitted. Captured frames are anonymised before analysis and deleted immediately after processing."
      footerActions={[
        { label: "Review Screenshots", icon: ImageIcon },
        { label: "Export Data", icon: Download },
        { label: "Pause Tracking", icon: PauseCircle },
        { label: "Delete Visual Data", icon: Trash2, danger: true },
      ]}
    >
      {/* ── Live Camera Feed ───────────────────────── */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Live Camera Feed</h3>
          <div className="flex items-center gap-2">
            <Badge className="border-red-200 bg-red-50 text-red-600 hover:bg-red-50 text-xs">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              Recording
            </Badge>
            <Badge variant="outline" className="text-[10px] text-gray-500">
              30 FPS · Local
            </Badge>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-inner">
          <div className="flex h-72 flex-col items-center justify-center gap-4">
            {/* Pulsing ring */}
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20" />
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-600/25 ring-1 ring-purple-400/40 backdrop-blur-sm">
                <Camera className="h-9 w-9 text-purple-300" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-300">Live Camera Feed</p>
              <p className="mt-1 text-xs text-gray-500">
                Face detection initialising · Awaiting stable frame
              </p>
            </div>
          </div>

          {/* Corner brackets */}
          <div className="absolute left-5 top-5 h-8 w-8 rounded-tl-md border-l-2 border-t-2 border-purple-400/50" />
          <div className="absolute right-5 top-5 h-8 w-8 rounded-tr-md border-r-2 border-t-2 border-purple-400/50" />
          <div className="absolute bottom-5 left-5 h-8 w-8 rounded-bl-md border-b-2 border-l-2 border-purple-400/50" />
          <div className="absolute bottom-5 right-5 h-8 w-8 rounded-br-md border-b-2 border-r-2 border-purple-400/50" />

          {/* Bottom info bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-5 py-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-gray-400">
                Visual AI Engine v2.1 · Local Processing Only
              </p>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-purple-400" />
                <span className="text-[10px] text-purple-400">AI Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3 Supporting Cards ──────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Emotion */}
        <Card className="border-l-4 border-l-purple-300 bg-white p-5 shadow-none">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Emotion</h3>
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gray-300" />
          </div>
          <div className="flex h-20 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-100 bg-gray-50">
            <div className="h-6 w-6 rounded-full bg-gray-200 opacity-60" />
            <p className="text-[11px] text-gray-400">Awaiting signal…</p>
          </div>
          <p className="mt-2.5 text-center text-[10px] text-gray-400">
            Neutral · Happy · Sad · Angry · Surprised
          </p>
        </Card>

        {/* rPPG */}
        <Card className="border-l-4 border-l-violet-300 bg-white p-5 shadow-none">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">rPPG</h3>
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gray-300" />
          </div>
          <div className="flex h-20 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-100 bg-gray-50">
            <div className="h-3 w-20 rounded-full bg-gray-200 opacity-60" />
            <p className="text-[11px] text-gray-400">Initialising…</p>
          </div>
          <p className="mt-2.5 text-center text-[10px] text-gray-400">
            Remote Photoplethysmography · BPM
          </p>
        </Card>

        {/* Stress Levels */}
        <Card className="border-l-4 border-l-fuchsia-300 bg-white p-5 shadow-none">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Stress Levels</h3>
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gray-300" />
          </div>
          <div className="flex h-20 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-100 bg-gray-50">
            <div className="h-2.5 w-24 rounded-full bg-gray-200 opacity-60" />
            <p className="text-[11px] text-gray-400">Calibrating…</p>
          </div>
          <p className="mt-2.5 text-center text-[10px] text-gray-400">
            Low · Moderate · High · Critical
          </p>
        </Card>
      </div>

      {/* ── AI Insights ─────────────────────────────── */}
      <InsightsCard
        accentBg="bg-purple-50"
        accentBorder="border-purple-100"
        accentTitle="text-purple-700"
        bulletColor="bg-purple-400"
        badge="Pending"
        insights={[
          {
            text: "Awaiting stable face detection to begin real-time emotion classification.",
          },
          {
            text: "rPPG analysis requires 15 s of continuous frame capture for an accurate heart-rate estimate.",
          },
          {
            text: "Stress-level scoring will activate once both emotion and rPPG baselines are established.",
          },
        ]}
      />
    </ModuleDialogBase>
  );
}
