import React, { useState } from 'react';
import { 
  Lock, 
  Key, 
  ShieldCheck, 
  X, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Image as ImageIcon,
  Flame,
  Plus
} from 'lucide-react';
import { UserProfile } from '../types';
import { PrivateVaultItem, VaultKeyAccessRequest } from '../types/anlatiTypes';

interface PrivateVaultModalProps {
  isOpen: boolean;
  targetUser: UserProfile;
  currentUser: UserProfile;
  onClose: () => void;
  onToast?: (msg: { text: string; type: 'success' | 'info' | 'error' }) => void;
}

export const PrivateVaultModal: React.FC<PrivateVaultModalProps> = ({
  isOpen,
  targetUser,
  currentUser,
  onClose,
  onToast,
}) => {
  const isOwner = currentUser.id === targetUser.id;
  const [hasAccess, setHasAccess] = useState<boolean>(isOwner || !!targetUser.vaultKeysGrantedTo?.includes(currentUser.id));
  const [keyRequested, setKeyRequested] = useState<boolean>(false);
  const [selectedVaultItem, setSelectedVaultItem] = useState<PrivateVaultItem | null>(null);

  // Mock vault items
  const [vaultItems, setVaultItems] = useState<PrivateVaultItem[]>([
    {
      id: 'v-1',
      type: 'photo',
      mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      caption: 'Amsterdam Penthouse özel çekimimiz (Sansürsüz)',
      isSensitive: true,
      uploadedAt: 'Dün',
    },
    {
      id: 'v-2',
      type: 'photo',
      mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      caption: 'Rotterdam Lifestyle After-Party anları',
      isSensitive: true,
      uploadedAt: '3 gün önce',
    },
    {
      id: 'v-3',
      type: 'photo',
      mediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
      caption: 'VIP Jakuzi suit samimi pozlar',
      isSensitive: true,
      uploadedAt: 'Geçen hafta',
    },
  ]);

  if (!isOpen) return null;

  const handleRequestKey = () => {
    setKeyRequested(true);
    if (onToast) {
      onToast({
        text: `${targetUser.name} kullanıcısına Gizli Kasa Anahtarı talebiniz iletildi. Onaylandığında bildirim alacaksınız.`,
        type: 'success',
      });
    }
  };

  const handleSimulateGrantAccess = () => {
    setHasAccess(true);
    if (onToast) {
      onToast({
        text: '🔑 Kasa anahtarı onaylandı! Özel sansürsüz albüm açıldı.',
        type: 'success',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-md">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm text-white">
                  Kilitli Özel Kasa (Private Vault)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                  18+ Sansürsüz
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {targetUser.name} tarafından yalnızca anahtar verilen çiftlere özel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {!hasAccess ? (
            /* Locked State with Key Request */
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 shadow-inner">
                  <Lock className="w-10 h-10 text-amber-500" />
                </div>
                <span className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-rose-600 text-white shadow-lg">
                  <Flame className="w-4 h-4" />
                </span>
              </div>

              <div className="max-w-xs space-y-1.5">
                <h4 className="font-bold text-base text-white">
                  Özel Albüm Kilitli
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Bu kasada {vaultItems.length} adet sansürsüz özel lifestyle görseli bulunmaktadır. Yalnızca {targetUser.name} tarafından anahtar yetkisi verilen profiller görüntüleyebilir.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 w-full text-left space-y-1.5 text-xs text-zinc-300">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Karşılıklı Güven ve Gizlilik Standardı</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Anahtar talebiniz profil sahibinin bildirim merkezine iletilir. Profil sahibi güven duyarsa kasayı sizin için açar.
                </p>
              </div>

              <div className="pt-2 flex flex-col w-full gap-2">
                <button
                  disabled={keyRequested}
                  onClick={handleRequestKey}
                  className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    keyRequested
                      ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg shadow-rose-600/20 active:scale-98'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span>
                    {keyRequested ? 'Anahtar Talebi İletildi (Bekleniyor)' : 'Kasa Anahtarı İste (Request Key)'}
                  </span>
                </button>

                {/* Instant demo toggle for quick testing */}
                <button
                  onClick={handleSimulateGrantAccess}
                  className="text-[11px] text-zinc-500 hover:text-rose-400 underline pt-1"
                >
                  [Demo Test: Profil Sahibi Olarak Anahtarı Anında Onayla]
                </button>
              </div>
            </div>
          ) : (
            /* Unlocked Vault Grid */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">Kasa Açık: Anahtar Erişimi Onaylandı</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  {vaultItems.length} Medya
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {vaultItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedVaultItem(item)}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-rose-500/60 transition-all shadow-md"
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={item.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                    
                    <div className="absolute bottom-2 left-2 right-2 text-left">
                      <span className="text-[10px] font-bold text-white line-clamp-1">
                        {item.caption}
                      </span>
                      <span className="text-[9px] text-zinc-400">
                        {item.uploadedAt}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="p-1 rounded-lg bg-black/60 text-white backdrop-blur-md flex items-center justify-center">
                        <Eye className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {isOwner && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (onToast) onToast({ text: 'Yeni gizli medya yükleme penceresi açıldı.', type: 'info' });
                    }}
                    className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-rose-500" />
                    <span>Kasaya Yeni Sansürsüz Medya Ekle</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Media Full Lightbox */}
        {selectedVaultItem && (
          <div className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4">
            <button
              onClick={() => setSelectedVaultItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 text-white hover:bg-zinc-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl">
              <img
                src={selectedVaultItem.mediaUrl}
                alt={selectedVaultItem.caption}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="mt-3 text-sm text-zinc-300 font-medium text-center">
              {selectedVaultItem.caption}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
