import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  ExternalLink,
  Sparkles,
  QrCode
} from 'lucide-react';

interface MobileInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileInstallModal: React.FC<MobileInstallModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'qr'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Direct shared URL
  const appUrl = 'https://ais-pre-znzxkynw23mfdng5hudciw-293372226864.asia-east1.run.app';

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#1c1c1c] border border-cyan-500/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-cyan-950/40 via-[#1e1e1e] to-purple-950/40 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] shrink-0">
              <img
                src="/assets/aistudio/ChatGPT_Image_Sep_23__2026__11_46_58_AM_304c70b5.png"
                alt="DURANTO Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>DURANTO Mobile Screen Par Layein</span>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </h3>
              <p className="text-[11px] text-cyan-300 font-mono">
                Install as Mobile App (Add to Home Screen)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* App Direct URL Box */}
          <div className="bg-[#141414] p-3 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-medium flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                Mobile Direct Link:
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                ● Live & Active
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 bg-black/60 border border-white/10 rounded-lg px-2.5 py-2 text-xs font-mono text-cyan-300 truncate focus:outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-950'
                }`}
                title="Copy Link to Clipboard"
              >
                {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Direct File Download Button */}
          <a
            href="/duranto-app.zip"
            download="duranto-app.zip"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/50 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer text-center"
          >
            <Download className="w-4 h-4 text-purple-400 stroke-[2.5]" />
            <span>App Ka Complete File Download Karein (.zip 2.1 MB)</span>
          </a>

          {/* Quick Install Button if browser supports it */}
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-black font-black text-xs shadow-lg shadow-emerald-950/60 transition-transform active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Mobile Phone Par Install Karein (1-Click)</span>
            </button>
          )}

          {/* Device Tabs */}
          <div className="flex rounded-lg bg-[#141414] p-1 border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-1.5 rounded-md font-bold transition-colors ${
                activeTab === 'android'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Android (Chrome)
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-1.5 rounded-md font-bold transition-colors ${
                activeTab === 'ios'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              iPhone (Safari)
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-1.5 rounded-md font-bold transition-colors ${
                activeTab === 'qr'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              QR Code
            </button>
          </div>

          {/* Tab Guides */}
          {activeTab === 'android' && (
            <div className="bg-[#141414] p-3.5 rounded-xl border border-white/5 space-y-2.5 text-xs text-neutral-300">
              <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center text-[10px]">
                  ✓
                </span>
                Android Phone Par Screen Par Laane Ka Tarika:
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-neutral-300 text-[11.5px] leading-relaxed">
                <li>
                  Upar diya gaya link copy karke apne phone ke <strong>Google Chrome</strong> browser mein kholein.
                </li>
                <li>
                  Chrome mein upar right corner ke <strong>3 Dots (⋮)</strong> par click karein.
                </li>
                <li>
                  Menu mein <strong>"Add to Home screen"</strong> ya <strong>"Install app"</strong> par tap karein.
                </li>
                <li>
                  Aapke phone ke home screen par <strong>DURANTO</strong> ka asli app icon lag jayega!
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="bg-[#141414] p-3.5 rounded-xl border border-white/5 space-y-2.5 text-xs text-neutral-300">
              <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-black font-bold flex items-center justify-center text-[10px]">
                  ✓
                </span>
                iPhone / iPad Par Screen Par Laane Ka Tarika:
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-neutral-300 text-[11.5px] leading-relaxed">
                <li>
                  Is link ko <strong>Safari Browser</strong> mein kholein.
                </li>
                <li>
                  Safari ke bottom bar mein <strong>Share Button (⬆️)</strong> par click karein.
                </li>
                <li>
                  Neeche scroll karein aur <strong>"Add to Home Screen"</strong> (+ sign) par tap karein.
                </li>
                <li>
                  Top-right mein <strong>"Add"</strong> dabayein. App icon home screen par ban jayega!
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="bg-[#141414] p-3.5 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-3 bg-white rounded-xl shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(appUrl)}&margin=4`}
                  alt="QR Code"
                  className="w-36 h-36"
                />
              </div>
              <p className="text-xs text-neutral-300">
                Apne mobile ke camera se is QR code ko scan karein aur direct open karein.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-[#161616] border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-neutral-400 text-[11px]">
            DURANTO Motion Engine v2.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
