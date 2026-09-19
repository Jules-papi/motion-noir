import React from 'react';
import { CreatePostModal } from './CreatePostModal';
import { CreateStoryModal } from './CreateStoryModal';
import { MediaModal } from './MediaModal';
import { CommentsModal } from './CommentsModal';
import { WalletModal } from './WalletModal';
import { MembershipModal } from './MembershipModal';
import { ReportModal } from './ReportModal';
import { KYCModal } from './KYCModal';
import { VisitorsModal } from './VisitorsModal';
import { NotificationsDrawer } from './NotificationsDrawer';
import { PayoutModal } from './PayoutModal';
import { Post, Comment, MembershipTier } from '../types';
import { useSocialPlatform } from '../hooks/useSocialPlatform';

interface AppModalsProps {
  p: ReturnType<typeof useSocialPlatform>;
  onSubmitPost: (postData: Partial<Post>) => void;
}

export const AppModals: React.FC<AppModalsProps> = ({ p, onSubmitPost }) => {
  return (
    <>
      <CreatePostModal
        currentUser={p.currentUser}
        isOpen={p.isCreatePostOpen}
        onClose={() => p.setIsCreatePostOpen(false)}
        onSubmitPost={onSubmitPost}
      />
      <CreateStoryModal
        currentUser={p.currentUser}
        isOpen={p.isCreateStoryOpen}
        onClose={() => p.setIsCreateStoryOpen(false)}
        onAddStory={p.handleAddStory}
      />
      <MediaModal
        post={p.selectedMediaPost}
        isOpen={!!p.selectedMediaPost}
        onClose={() => p.setSelectedMediaPost(null)}
        isUserSubscribed={p.effectiveIsSubscribed}
        walletBalance={p.walletBalance}
        onLike={p.handleLike}
        onSave={p.handleSave}
        onSubscribeClick={() => {}}
        onUnlockPPV={p.handleUnlockPPV}
      />
      <CommentsModal
        post={p.selectedCommentsPost}
        isOpen={!!p.selectedCommentsPost}
        onClose={() => p.setSelectedCommentsPost(null)}
        currentUser={p.currentUser}
        onAddComment={(postId, text) => {
          const newComment: Comment = {
            id: `c-${Date.now()}`,
            author: {
              id: p.currentUser.id,
              name: p.currentUser.name,
              username: p.currentUser.username,
              avatar: p.currentUser.avatar,
              isVerified: p.currentUser.isVerified,
            },
            text,
            createdAt: 'Şimdi',
            likes: 0,
            isLiked: false,
          };
          p.setPosts(prev => prev.map(post => post.id === postId ? {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: [...(post.comments || []), newComment],
          } : post));
          p.showToast('Yorumunuz paylaşıldı!', 'success');
        }}
      />
      <WalletModal
        isOpen={p.isWalletOpen}
        onClose={() => p.setIsWalletOpen(false)}
        walletBalance={p.walletBalance}
        onAddBalance={(amt) => {
          p.setWalletBalance(prev => prev + amt);
          p.showToast(`${amt} ₺ cüzdana yüklendi!`, 'success');
        }}
      />
      <MembershipModal
        isOpen={p.isMembershipModalOpen}
        onClose={() => p.setIsMembershipModalOpen(false)}
        currentTier={p.currentUser.membershipTier || 'standard'}
        walletBalance={p.walletBalance}
        onSelectTier={(tier: MembershipTier, price: number) => {
          p.setWalletBalance(prev => prev - price);
          p.setCurrentUser(prev => ({ ...prev, membershipTier: tier }));
          p.setIsMembershipModalOpen(false);
          p.showToast(`${tier.toUpperCase()} üyelik aktif edildi!`, 'success');
        }}
        onOpenWallet={() => p.setIsWalletOpen(true)}
      />
      {p.reportingTarget && (
        <ReportModal
          isOpen={!!p.reportingTarget}
          target={p.reportingTarget}
          onClose={() => p.setReportingTarget(null)}
          onSubmitReport={(reportData) => {
            p.setReports(prev => [{
              id: `rep-${Date.now()}`,
              reporterName: p.currentUser.name,
              targetType: reportData.targetType,
              targetTitle: reportData.targetTitle,
              targetId: reportData.targetId,
              reason: reportData.reason,
              description: reportData.description,
              aiRiskScore: 88,
              aiFlagReason: 'Yeni bildirim moderasyon kuyruğuna alındı.',
              status: 'pending',
              createdAt: 'Şimdi',
            }, ...prev]);
            p.setReportingTarget(null);
            p.showToast('Şikayetiniz moderasyon kuyruğuna iletildi.', 'success');
          }}
        />
      )}
      <KYCModal
        isOpen={p.isKYCModalOpen}
        onClose={() => p.setIsKYCModalOpen(false)}
        currentUser={p.currentUser}
        onCompleteVerification={p.handleCompleteKYC}
      />
      <VisitorsModal
        isOpen={p.isVisitorsModalOpen}
        onClose={() => p.setIsVisitorsModalOpen(false)}
        visitors={p.visitors}
        currentUser={p.currentUser}
        onUpgradeToVip={() => {
          p.setIsVisitorsModalOpen(false);
          p.setIsMembershipModalOpen(true);
        }}
      />
      <NotificationsDrawer
        isOpen={p.isNotificationsOpen}
        onClose={() => p.setIsNotificationsOpen(false)}
        notifications={p.notifications}
        onMarkAllAsRead={p.handleMarkAllNotificationsRead}
        onSelectNotification={() => p.setIsNotificationsOpen(false)}
      />
      <PayoutModal
        isOpen={p.isPayoutModalOpen}
        onClose={() => p.setIsPayoutModalOpen(false)}
        currentUser={p.currentUser}
        totalEarnings={3850}
        payouts={p.payouts}
        onRequestPayout={p.handleRequestPayout}
      />
    </>
  );
};
