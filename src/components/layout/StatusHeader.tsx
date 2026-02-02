import { MapPin, Clock, CheckCircle2 } from 'lucide-react';

export default function StatusHeader() {
    return (
        <div className="flex items-center justify-between text-sm text-text-secondary px-6 py-4">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-semibold">Online Synched</span>
                </div>

                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Pizza E'Birra Gandaria City - Front</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Tue, 24 Jan 2023 • 17:21:45</span>
                </div>
                <button className="px-4 py-1.5 bg-blue-50 text-primary font-semibold rounded-lg text-sm">
                    Open
                </button>
            </div>
        </div>
    );
}
