import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { Button } from './Button';
import { ResultDisplay } from './ResultDisplay';
import { generateVTOWithGemini } from '../services/geminiService';
import { Shirt, AlertCircle } from 'lucide-react';

export const VTOTab: React.FC = () => {
  const [userImage, setUserImage] = useState<string | null>(null);

  // Single garment mode state
  const [garmentImage, setGarmentImage] = useState<string | null>(null);

  // Outfit combination mode state
  const [upperGarment, setUpperGarment] = useState<string | null>(null);
  const [lowerGarment, setLowerGarment] = useState<string | null>(null);

  const [mode, setMode] = useState<'single' | 'outfit'>('single');

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);

    if (!userImage) {
      setError("Please upload a user photo.");
      return;
    }

    if (mode === 'single' && !garmentImage) {
      setError("Please upload a garment photo.");
      return;
    }

    if (mode === 'outfit' && (!upperGarment || !lowerGarment)) {
      setError("Please upload both upper and lower outfit photos.");
      return;
    }

    setIsGenerating(true);

    try {
      const generatedImage = await generateVTOWithGemini({
        userBase64: userImage,
        garmentBase64: mode === 'single' ? garmentImage! : undefined,
        upperBase64: mode === 'outfit' ? upperGarment! : undefined,
        lowerBase64: mode === 'outfit' ? lowerGarment! : undefined,
      });
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
    // Optional: Keep the inputs or clear them. Keeping them is usually better UX.
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
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg">2</span>
                Garment
              </h3>

              <div className="flex bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setMode('single')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'single' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Single
                </button>
                <button
                  onClick={() => setMode('outfit')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'outfit' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Outfit
                </button>
              </div>
            </div>

            {mode === 'single' ? (
              <div className="flex-1">
                <ImageUploader
                  label="Outfit"
                  image={garmentImage}
                  onImageChange={setGarmentImage}
                  heightClass="h-80"
                />
                <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                  Upload an image of the clothing item.
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-4">
                <ImageUploader
                  label="Upper Outfit"
                  image={upperGarment}
                  onImageChange={setUpperGarment}
                  heightClass="h-36"
                />
                <ImageUploader
                  label="Lower Outfit"
                  image={lowerGarment}
                  onImageChange={setLowerGarment}
                  heightClass="h-36"
                />
              </div>
            )}

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
            disabled={!userImage || (mode === 'single' ? !garmentImage : (!upperGarment || !lowerGarment))}
          >
            <Shirt size={20} />
            Try On Now
          </Button>
        </div>
      </div>
    </div>
  );
};
