import React, { useState } from 'react';
import { 
  Heart, 
  ShieldCheck, 
  Key, 
  Check, 
  ExternalLink,
  Users
} from 'lucide-react';
import { ProfileType, RelationshipStatus, PartnerConnection, CoupleDetails } from '../types/anlatiTypes';

interface RelationshipPartnerCardProps {
  profileType: ProfileType;
  relationshipStatus: RelationshipStatus;
  partner?: PartnerConnection;
  coupleDetails?: CoupleDetails;
  onUpdatePartner?: (partnerName: string) => void;
  onViewPartnerProfile?: (username: string) => void;
  onOpenVault?: () => void;
}

export const RelationshipPartnerCard: React.FC<RelationshipPartnerCardProps> = ({
  relationshipStatus,
  partner: initialPartner,
  coupleDetails,
  onUpdatePartner,
  onViewPartnerProfile,
  onOpenVault,
}) => {
  const [partner] = useState<PartnerConnection | undefined>(initialPartner || {
    partnerId: 'p-1',
    partnerName: 'Anna Van Dijk',
    partnerUsername: 'anna_amsterdam',
    partnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'dual_verified',
    connectedSince: '2 years',
    isPublicOnProfile: true,
    mutualConsentConfirmed: true,
  });

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUsername.trim()) return;
    setInviteSent(true);
    setTimeout(() => {
      if (onUpdatePartner) {
        onUpdatePartner(inviteUsername.trim());
      }
      setIsInviteOpen(false);
      setInviteSent(false);
      setInviteUsername('');
    }, 900);
  };

  return (
    <div className="rounded-2xl bg-[#121419] border border-white/[0.08] p-6 sm:p-8 space-y-6 shadow-xl">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#E5C590] uppercase block">
            Duo Dossier & Attestation
          </span>
          <h3 className="font-serif text-xl sm:text-2xl text-white font-normal tracking-tight">
            Consensual Non-Monogamy Couple
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#151a16] text-emerald-300 border border-emerald-600/30 text-[10px] font-sans uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dual Attested & Consenting</span>
          </span>
        </div>
      </div>

      {/* Duo Photography & Personas Split */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Partner A */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[#181B22] border border-white/[0.06]">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
            alt="Alexander"
            className="w-16 h-16 rounded-xl object-cover filter contrast-[1.05] border border-white/10"
          />
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Partner I</span>
            <h4 className="font-serif text-base text-white">Alexander, 31</h4>
            <span className="text-xs text-zinc-400 font-sans block">Primary Patron · Amsterdam</span>
          </div>
        </div>

        {/* Partner B */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#181B22] border border-white/[0.06]">
          <div className="flex items-center gap-4">
            <img
              src={partner?.partnerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={partner?.partnerName || 'Anna'}
              className="w-16 h-16 rounded-xl object-cover filter contrast-[1.05] border border-white/10"
            />
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Partner II</span>
              <h4 className="font-serif text-base text-white">{partner?.partnerName || 'Anna Van Dijk'}, 29</h4>
              <span className="text-xs text-zinc-400 font-sans block">Connected for 2 years</span>
            </div>
          </div>

          {onViewPartnerProfile && (
            <button
              onClick={() => onViewPartnerProfile(partner?.partnerUsername || 'anna_amsterdam')}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="View Partner Profile"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Shared Ethos & Joint Preferences */}
      <div className="p-4 rounded-xl bg-[#181B22] border border-white/[0.06] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs text-white font-medium font-serif">
            Joint Salon Participation & Protocol
          </span>
          <span className="text-[11px] font-mono text-[#E5C590]">
            Shared RSVP & Dual Check-In Enabled
          </span>
        </div>
        <p className="text-xs text-zinc-400 font-sans font-light leading-relaxed">
          Attending intimate salons, private vernissages, and select villa retreats together. Both profiles hold reciprocal confirmation rights for joint dispatches.
        </p>
      </div>
    </div>
  );
};
