import React, { useState } from 'react';
import { Sparkles, Wand2, Download, Loader2 } from 'lucide-react';

export default function ThumbnailGenerator() {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('photographic');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [imageUrl, setImageUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const styles = [
        { id: 'photographic', label: 'Photographic', desc: 'Realistic photo style' },
        { id: 'digital-art', label: 'Digital Art', desc: 'Vibrant digital painting' },
        { id: 'cinematic', label: 'Cinematic', desc: 'Movie poster aesthetic' },
        { id: 'minimalist', label: 'Minimalist', desc: 'Clean and simple' },
        { id: 'bold-graphic', label: 'Bold Graphic', desc: 'Strong colors and shapes' }
    ];

    const ratios = [
        { id: '16:9', label: '16:9', size: '1024x1024' }, // DALL-E 3 standard, we'll crop or just use it
        { id: '4:3', label: '4:3', size: '1024x1024' },
        { id: '1:1', label: '1:1', size: '1024x1024' }
    ];

    const generateThumbnail = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt');
            return;
        }

        setIsGenerating(true);
        setError('');
        setImageUrl('');

        try {
            const enhancedPrompt = `${prompt}, ${style} style, high quality, professional thumbnail, eye-catching`;

            // Start prediction via local Vite proxy
            const token = import.meta.env.VITE_OPENAI_API_KEY;
            if (!token) {
                throw new Error('Missing VITE_OPENAI_API_KEY in .env file');
            }

            const response = await fetch('/api/openai/images/generations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    model: "dall-e-3",
                    prompt: enhancedPrompt,
                    n: 1,
                    size: "1024x1024",
                    quality: "standard",
                    response_format: "url"
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error:', errorData); // For debugging in console
                throw new Error(errorData.error?.message || `Failed to generate image: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.data && data.data[0] && data.data[0].url) {
                setImageUrl(data.data[0].url);
            } else {
                throw new Error('Generation failed - No image returned');
            }
        } catch (err) {
            console.error("Generation Error:", err);
            // Check specifically for billing/quota errors to provide a helpful fallback
            if (err.message && (err.message.toLowerCase().includes('billing') || err.message.toLowerCase().includes('quota'))) {
                setError('Billing limit reached. Displaying a DEMO image for testing purposes.');
                // High-quality abstract digital art from Unsplash as a fallback
                setImageUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1024&auto=format&fit=crop');
            } else {
                setError(err.message || 'Failed to generate thumbnail. Please try again.');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadImage = async () => {
        if (!imageUrl) return;

        try {
            // For OpenAI URLs, we might need to fetch it first to avoid CORS issues if directly downloading,
            // but usually a direct link works or opening in new tab. 
            // To force download properly without CORS issues on client side:
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `thumbnail-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Download failed, trying direct link", e);
            window.open(imageUrl, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Mono:wght@400;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Space Mono', monospace;
          overflow-x: hidden;
        }

        .title-text {
          font-family: 'Archivo Black', sans-serif;
          letter-spacing: -0.02em;
        }

        .glow-border {
          position: relative;
          border: 2px solid transparent;
          background: linear-gradient(to right, #1e1b4b, #581c87) padding-box,
                      linear-gradient(135deg, #8b5cf6, #ec4899, #8b5cf6) border-box;
          animation: border-glow 3s ease-in-out infinite;
        }

        @keyframes border-glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.3); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .float-animation {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
        }

        .generating-pulse {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .style-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .style-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
          opacity: 0;
          transition: opacity 0.3s;
        }

        .style-card:hover::before {
          opacity: 1;
        }

        .style-card:hover {
          transform: translateY(-2px) scale(1.02);
          border-color: #8b5cf6;
        }

        .style-card.selected {
          border-color: #ec4899;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2));
        }

        .ratio-btn {
          transition: all 0.3s ease;
        }

        .ratio-btn:hover {
          transform: scale(1.05);
        }

        .ratio-btn.selected {
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        input:focus, textarea:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
        }

        .gradient-text {
          background: linear-gradient(135deg, #8b5cf6, #ec4899, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

            {/* Header */}
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-12 fade-in">
                    <div className="inline-flex items-center gap-3 mb-4 float-animation">
                        <Sparkles className="w-12 h-12 text-purple-400" />
                        <h1 className="title-text text-6xl md:text-7xl gradient-text">
                            THUMB.AI
                        </h1>
                        <Wand2 className="w-12 h-12 text-pink-400" />
                    </div>
                    <p className="text-gray-400 text-lg tracking-wide">
                        Generate stunning thumbnails with AI · Powered by OpenAI DALL-E 3
                    </p>
                </div>

                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
                    {/* Left Panel - Controls */}
                    <div className="space-y-6 fade-in" style={{ animationDelay: '0.2s' }}>
                        {/* Prompt Input */}
                        <div className="glow-border rounded-2xl p-6 bg-slate-900/50 backdrop-blur">
                            <label className="block text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">
                                Your Vision
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="A futuristic city at sunset with flying cars..."
                                className="w-full bg-slate-800/80 text-white rounded-xl p-4 text-sm leading-relaxed resize-none border-2 border-slate-700 hover:border-purple-500 transition-all"
                                rows="4"
                            />
                        </div>

                        {/* Style Selection */}
                        <div className="glow-border rounded-2xl p-6 bg-slate-900/50 backdrop-blur">
                            <label className="block text-sm font-bold text-purple-300 mb-4 uppercase tracking-wider">
                                Aesthetic Style
                            </label>
                            <div className="grid grid-cols-1 gap-3">
                                {styles.map((s) => (
                                    <div
                                        key={s.id}
                                        onClick={() => setStyle(s.id)}
                                        className={`style-card p-4 rounded-xl border-2 ${style === s.id ? 'selected' : 'border-slate-700'
                                            }`}
                                    >
                                        <div className="font-bold text-white">{s.label}</div>
                                        <div className="text-sm text-gray-400">{s.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Aspect Ratio */}
                        <div className="glow-border rounded-2xl p-6 bg-slate-900/50 backdrop-blur">
                            <label className="block text-sm font-bold text-purple-300 mb-4 uppercase tracking-wider">
                                Dimensions
                            </label>
                            <div className="flex gap-3">
                                {ratios.map((r) => (
                                    <button
                                        key={r.id}
                                        onClick={() => setAspectRatio(r.id)}
                                        className={`ratio-btn flex-1 py-3 rounded-xl border-2 font-bold ${aspectRatio === r.id
                                            ? 'selected text-white'
                                            : 'border-slate-700 bg-slate-800/50 text-gray-300 hover:border-purple-500'
                                            }`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={generateThumbnail}
                            disabled={isGenerating}
                            className={`w-full py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all ${isGenerating
                                ? 'bg-slate-700 text-gray-400 cursor-not-allowed generating-pulse'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-purple-500/50 transform hover:scale-[1.02]'
                                }`}
                        >
                            {isGenerating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating Magic...
                                </span>
                            ) : (
                                'Generate Thumbnail'
                            )}
                        </button>

                        {error && (
                            <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-4 text-red-300 text-sm">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Preview */}
                    <div className="fade-in" style={{ animationDelay: '0.4s' }}>
                        <div className="sticky top-8">
                            <div className="glow-border rounded-2xl p-6 bg-slate-900/50 backdrop-blur">
                                <label className="block text-sm font-bold text-purple-300 mb-4 uppercase tracking-wider">
                                    Generated Thumbnail
                                </label>

                                <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden relative group">
                                    {imageUrl ? (
                                        <>
                                            <img
                                                src={imageUrl}
                                                alt="Generated thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={downloadImage}
                                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transform hover:scale-105 transition-all shadow-lg"
                                                >
                                                    <Download className="w-5 h-5" />
                                                    Download
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                                            {isGenerating ? (
                                                <div className="text-center">
                                                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-400" />
                                                    <p className="text-sm">Creating your thumbnail...</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                                                    <p className="text-sm">Your masterpiece will appear here</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {imageUrl && (
                                    <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <p className="text-xs text-gray-400 mb-1">Generated Prompt:</p>
                                        <p className="text-sm text-gray-300 leading-relaxed">{prompt}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-16 text-gray-500 text-sm">
                    <p>Built with React + OpenAI DALL-E 3</p>
                </div>
            </div>
        </div>
    );
}
