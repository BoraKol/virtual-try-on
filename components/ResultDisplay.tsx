import React from 'react';
import { Download, ExternalLink, RefreshCcw } from 'lucide-react';
import { Button } from './Button';

interface ResultDisplayProps {
  resultImage: string;
  onDownload: () => void;
  onReset: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ resultImage, onDownload, onReset }) => {
  return (
    <div className="w-full animate-in fade-in zoom-in duration-500">
      <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-2 shadow-2xl">
        <div className="relative rounded-2xl overflow-hidden bg-black/40 aspect-square md:aspect-video flex items-center justify-center">
            <img 
              src={resultImage} 
              alt="Generated Result" 
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
        <Button onClick={onDownload} variant="primary" className="w-full sm:w-auto">
          <Download size={18} />
          Download Image
        </Button>
        <Button onClick={onReset} variant="outline" className="w-full sm:w-auto">
          <RefreshCcw size={18} />
          Start Over
        </Button>
      </div>
    </div>
  );
};
