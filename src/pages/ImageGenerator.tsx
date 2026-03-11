import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Image as ImageIcon, Loader2, Download } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio,
            imageSize: size,
          },
        },
      });

      let imageUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        setGeneratedImage(imageUrl);
      } else {
        setError('未能生成图像，请重试。');
      }
    } catch (err: any) {
      console.error('Image generation error:', err);
      setError(err.message || '生成图像时发生错误。请确保您已选择有效的API密钥。');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">AI 图像生成</h1>
        <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-800">
          gemini-3-pro-image-preview
        </span>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 space-y-6">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-2">
            图像描述 (Prompt)
          </label>
          <textarea
            id="prompt"
            rows={3}
            className="block w-full rounded-md border border-slate-300 py-3 px-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="描述您想生成的图像，例如：一个未来科技风格的办公室，带有全息投影屏幕..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">分辨率大小</label>
            <div className="flex space-x-4">
              {['1K', '2K', '4K'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s as any)}
                  className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors ${
                    size === s
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">宽高比</label>
            <div className="flex space-x-4">
              {['1:1', '16:9', '9:16'].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio as any)}
                  className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors ${
                    aspectRatio === ratio
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                正在生成图像...
              </>
            ) : (
              <>
                <ImageIcon className="-ml-1 mr-2 h-5 w-5" />
                生成图像
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">生成失败</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {generatedImage && (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-900">生成结果</h3>
            <a
              href={generatedImage}
              download="generated-image.png"
              className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50"
            >
              <Download className="-ml-1 mr-2 h-4 w-4" />
              下载图像
            </a>
          </div>
          <div className="flex justify-center bg-slate-100 rounded-lg p-4">
            <img
              src={generatedImage}
              alt="Generated"
              className="max-w-full h-auto rounded shadow-sm"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
