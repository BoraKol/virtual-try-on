import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { Button } from './Button';
import { ResultDisplay } from './ResultDisplay';
import { editImageWithGemini } from '../services/geminiService';
import { Wand2, AlertCircle } from 'lucide-react';

export const EditorTab: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!sourceImage) {
      setError("Please upload an image first.");
      return;
    }
    if (!prompt.trim()) {
      setError("Please enter a prompt describing the changes.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const generatedImage = await editImageWithGemini(sourceImage, prompt);
      setResult(generatedImage);
    } catch (e) {
      setError("Failed to generate image. Please try again.");
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const link = document.createElement('a');
      link.href = result;
      link.download = `nano-edit-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSourceImage(null);
    setPrompt('');
    setError(null);
  };

  if (result) {
    return <ResultDisplay resultImage={result} onDownload={handleDownload} onReset={handleReset} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg">1</span> 
              Upload Image
            </h3>
            <ImageUploader 
              label="Original Photo" 
              image={sourceImage} 
              onImageChange={setSourceImage} 
              heightClass="h-80"
            />
          </div>
        </div>

        <div className="space-y-6 flex flex-col">
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex-1">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg">2</span> 
              Describe Edit
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., 'Add a retro filter', 'Make it snowy', 'Remove the person in the background'"
                  className="w-full h-40 bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                />
              </div>
              
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-6 z-10">
        <div className="max-w-md mx-auto bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-slate-700 shadow-2xl">
          <Button 
            onClick={handleGenerate} 
            isLoading={isGenerating} 
            className="w-full text-lg"
            disabled={!sourceImage || !prompt.trim()}
          >
            <Wand2 size={20} />
            Generate Edit
          </Button>
        </div>
      </div>
    </div>
  );
};
