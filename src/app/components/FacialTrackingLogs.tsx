import { Shield, ExternalLink } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

const mockCaptures = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1758521541816-49d0090fccc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHZpZGVvJTIwY2FsbCUyMGxhcHRvcHxlbnwxfHx8fDE3NzM2MzQ5ODh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    timestamp: 'Today, 2:34 PM',
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1678013815462-e05a1290eabf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjB3b3JraW5nJTIwY29tcHV0ZXIlMjBkZXNrfGVufDF8fHx8MTc3MzYzNDk4OHww&ixlib=rb-4.1.0&q=80&w=1080',
    timestamp: 'Today, 11:20 AM',
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1758874573113-aa93077f421f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBob21lJTIwb2ZmaWNlJTIwd2ViY2FtfGVufDF8fHx8MTc3MzYzNDk4OXww&ixlib=rb-4.1.0&q=80&w=1080',
    timestamp: 'Yesterday, 4:15 PM',
  },
  {
    id: 4,
    imageUrl: 'https://images.unsplash.com/photo-1758598307046-22f11e2a6917?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b3Jrc3BhY2UlMjBsYXB0b3B8ZW58MXx8fHwxNzczNTQ0MDM3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    timestamp: 'Yesterday, 9:45 AM',
  },
];

export function FacialTrackingLogs() {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Facial Tracking Logs</h3>
            <p className="mt-1 text-sm text-gray-500">
              Review captured data from consented tracking sessions
            </p>
          </div>
          <Button variant="outline" size="sm">
            View All
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Thumbnail Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {mockCaptures.map((capture) => (
            <div
              key={capture.id}
              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition-all hover:shadow-md"
            >
              <div className="aspect-video">
                <ImageWithFallback
                  src={capture.imageUrl}
                  alt={`Capture from ${capture.timestamp}`}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-xs font-medium text-white">{capture.timestamp}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Privacy Note */}
        <div className="flex items-start gap-3 rounded-lg border border-teal-200 bg-teal-50 p-4">
          <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
          <div>
            <p className="text-sm font-medium text-teal-900">Privacy Protected</p>
            <p className="mt-1 text-xs text-teal-700">
              Only consented captures are stored and visible to you. You can delete any capture at any time.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
