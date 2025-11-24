import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { Button } from './Button';
import { ResultDisplay } from './ResultDisplay';
import { generateVTOWithGemini } from '../services/geminiService';
import { Shirt, AlertCircle } from 'lucide-react';

export const VTOTab: React.FC = () => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!userImage || !garmentImage) {
      setError("Please upload both a user photo and a garment photo.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const generatedImage = await generateVTOWithGemini(userImage, garmentImage);
      setResult(generatedImage);
    } catch (e) {
      setError("Failed to generate try-on image. Please ensure inputs are clear.");
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const link = document.createElement('a');
      link.href = result;
      link.download = `nano-vto-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setResult(null);
    setUserImage(null);
    setGarmentImage(null);
    setError(null);
  };

  if (result) {
    return <ResultDisplay resultImage={result} onDownload={handleDownload} onReset={handleReset} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 h-full">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg">1</span> 
              User Photo
            </h3>
            <ImageUploader 
              label="Person" 
              image={userImage} 
              onImageChange={setUserImage} 
              heightClass="h-80"
            />
            <p className="text-xs text-slate-500 mt-4 leading-relaxed">
              Upload a clear full-body or half-body shot. Ensure good lighting for best results.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 h-full">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg">2</span> 
              Garment Photo
            </h3>
            <ImageUploader 
              label="Outfit" 
              image={garmentImage} 
              onImageChange={setGarmentImage} 
              heightClass="h-80"
            />
             <p className="text-xs text-slate-500 mt-4 leading-relaxed">
              Upload an image of the clothing item (flat lay or on a mannequin works best).
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-md mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="sticky bottom-6 z-10">
        <div className="max-w-md mx-auto bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-slate-700 shadow-2xl">
          <Button 
            onClick={handleGenerate} 
            isLoading={isGenerating} 
            className="w-full text-lg"
            disabled={!userImage || !garmentImage}
          >
            <Shirt size={20} />
            Try On Now
          </Button>
        </div>
      </div>
    </div>
  );
};
