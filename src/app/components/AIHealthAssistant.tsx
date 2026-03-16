import { MessageCircle, Sparkles } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const suggestedPrompts = [
  'Why did my score drop this week?',
  'How is my stress level changing?',
  'What should I improve for better sleep?',
];

export function AIHealthAssistant() {
  return (
    <Card className="overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Health Assistant</h3>
              <Badge className="mt-1 bg-purple-100 text-purple-700 hover:bg-purple-100">
                Online
              </Badge>
            </div>
          </div>
          <MessageCircle className="h-5 w-5 text-purple-400" />
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-gray-700">
          Get personalized insights about your health data, understand score changes, and receive
          supportive recommendations.
        </p>

        {/* Suggested Prompts */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            Try asking:
          </p>
          <div className="space-y-2">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                className="w-full rounded-lg border border-purple-200 bg-white px-4 py-2.5 text-left text-sm text-gray-700 transition-all hover:border-purple-300 hover:bg-purple-50"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          Start Conversation
        </Button>
      </div>
    </Card>
  );
}
