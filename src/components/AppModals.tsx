import React from 'react';
import { CreatePostModal } from './CreatePostModal';
import { MediaModal } from './MediaModal';
import { CommentsModal } from './CommentsModal';
import { ReportModal } from './ReportModal';
import { NotificationsDrawer } from './NotificationsDrawer';
import { AuthModal } from './AuthModal';
import { Post, Comment } from '../types';
import { useSocialPlatform } from '../hooks/useSocialPlatform';
import { noirApi } from '../services/noirApi';

interface AppModalsProps {
  p: ReturnType<typeof useSocialPlatform>;
  onSubmitPost: (postData: Partial<Post>) => void;
}

export const AppModals: React.FC<AppModalsProps> = ({ p, onSubmitPost }) => {
  return (
    <>
      <AuthModal
        isOpen={p.isAuthOpen}
        onClose={() => p.setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          p.setCurrentUser({ ...user, isGuest: false });
          p.setIsAuthOpen(false);
          noirApi.getFollowingIds(user.id).then(f => p.setFollowingIds(f));
          noirApi.getPosts(user.id).then(posts => p.setPosts(posts));
        }}
        onToast={(msg) => p.showToast(msg.text, msg.type)}
      />

      <CreatePostModal
        currentUser={p.currentUser}
        isOpen={p.isCreatePostOpen}
        onClose={() => p.setIsCreatePostOpen(false)}
        onSubmitPost={onSubmitPost}
      />

      <MediaModal
        post={p.selectedMediaPost}
        isOpen={!!p.selectedMediaPost}
        onClose={() => p.setSelectedMediaPost(null)}
        isUserSubscribed={p.effectiveIsSubscribed}
        walletBalance={p.walletBalance}
        onLike={p.handleLike}
        onSave={p.handleSave}
        onSubscribeClick={() => {
          p.showToast('Patron privileges are fully active on your dossier.', 'info');
        }}
        onUnlockPPV={(post) => {
          p.setPosts(prev => prev.map(pt => pt.id === post.id ? { ...pt, isPPV: false } : pt));
          p.setSelectedMediaPost(prev => prev && prev.id === post.id ? { ...prev, isPPV: false } : prev);
          p.showToast('Archive plate unsealed.', 'success');
        }}
      />

      <CommentsModal
        post={p.selectedCommentsPost}
        isOpen={!!p.selectedCommentsPost}
        onClose={() => p.setSelectedCommentsPost(null)}
        currentUser={p.currentUser}
        onAddComment={async (postId, text) => {
          if (p.currentUser.isGuest) {
            p.showToast('Yorum yapmak için lütfen giriş yapın veya üye olun.', 'info');
            p.setIsAuthOpen(true);
            return;
          }
          try {
            const added = await noirApi.addComment(postId, p.currentUser.id, text);
            if (added) {
              p.setPosts(prev => prev.map(post => post.id === postId ? {
                ...post,
                commentsCount: (post.commentsCount || 0) + 1,
                comments: [...(post.comments || []), added],
              } : post));
              p.setSelectedCommentsPost(prev => prev && prev.id === postId ? {
                ...prev,
                commentsCount: (prev.commentsCount || 0) + 1,
                comments: [...(prev.comments || []), added],
              } : prev);
              p.showToast('Yorumunuz salona iletildi.', 'success');
            }
          } catch (err) {
            console.error('Error adding comment:', err);
            p.showToast('Yorum iletilirken bir hata oluştu.', 'error');
          }
        }}
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
              aiFlagReason: 'Report submitted to moderation queue.',
              status: 'pending',
              createdAt: 'Just now',
            }, ...prev]);
            p.setReportingTarget(null);
            p.showToast('Your report was forwarded to moderation.', 'success');
          }}
        />
      )}

      <NotificationsDrawer
        isOpen={p.isNotificationsOpen}
        onClose={() => p.setIsNotificationsOpen(false)}
        notifications={p.notifications}
        onMarkAllAsRead={p.handleMarkAllNotificationsRead}
        onSelectNotification={() => p.setIsNotificationsOpen(false)}
      />
    </>
  );
};
