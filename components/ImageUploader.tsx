import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  image: string | null;
  onImageChange: (base64: string | null) => void;
  heightClass?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  label, 
  image, 
  onImageChange,
  heightClass = "h-64"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    resizeImageFile(file, 1024, 0.8)
      .then((dataUrl) => onImageChange(dataUrl))
      .catch(() => {
        // Fallback to raw if resize fails
        const reader = new FileReader();
        reader.onloadend = () => onImageChange(reader.result as string);
        reader.readAsDataURL(file);
      });
  };

  const resizeImageFile = (file: File, maxDim: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => reject(new Error('file-read-error'));
      fr.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('canvas-context-null'));
            return;
          }
          // Fill white background to avoid black alpha when exporting to JPEG
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          // Always export as JPEG to keep size small
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('image-load-error'));
        img.src = fr.result as string;
      };
      fr.readAsDataURL(file);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full group">
      <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">{label}</label>
      <div 
        className={`relative w-full ${heightClass} border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden
          ${dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="image/*"
          onChange={handleChange}
        />

        {image ? (
          <div className="relative w-full h-full">
            <img src={image} alt="Uploaded" className="w-full h-full object-contain" />
            <button 
              onClick={clearImage}
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-500/80 text-white rounded-full backdrop-blur-sm transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 group-hover:text-slate-300 transition-colors">
            <div className="p-4 bg-slate-800 rounded-full mb-3 shadow-xl">
              <Upload size={24} />
            </div>
            <p className="text-sm font-medium">Click to upload or drag & drop</p>
            <p className="text-xs opacity-60 mt-1">PNG, JPG up to 5MB</p>
          </div>
        )}
      </div>
    </div>
  );
};
