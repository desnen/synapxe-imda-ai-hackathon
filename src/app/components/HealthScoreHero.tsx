import { TrendingUp } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

export function HealthScoreHero() {
  const score = 82;
  const maxScore = 100;
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <div className="bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 p-8">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
          {/* Left Section: Score Visualization */}
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:gap-8">
            <div className="relative">
              <svg className="h-40 w-40 -rotate-90 transform">
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e5e7eb"
                  strokeWidth="10"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="url(#gradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">{score}</span>
                <span className="text-sm text-gray-500">/ {maxScore}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-center lg:text-left">
              <h2 className="text-2xl font-semibold text-gray-900">Overall Mental Health Score</h2>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  Good & Stable
                </Badge>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">+3 this week</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: AI Summary */}
          <div className="max-w-md rounded-xl bg-white/80 p-6 shadow-sm backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-teal-500"></div>
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                AI Health Summary
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-700">
              Your overall health appears stable, with strong cardiovascular recovery and moderate stress levels. 
              Consider improving sleep quality for optimal wellbeing.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}