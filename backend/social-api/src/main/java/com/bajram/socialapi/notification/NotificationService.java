package com.bajram.socialapi.notification;

import com.bajram.socialapi.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void notifyFollow(User actor, User recipient) {
        if (actor.getId().equals(recipient.getId())) return; // safety, shouldn't happen
        notificationRepository.save(new Notification(recipient, actor, NotificationType.FOLLOW, null, null));
    }

    @Transactional
    public void notifyLike(User actor, User recipient, Long postId) {
        if (actor.getId().equals(recipient.getId())) return; // don't notify yourself
        boolean alreadyNotified = notificationRepository
                .existsByActorAndRecipientAndPostIdAndType(actor, recipient, postId, NotificationType.LIKE);
        if (alreadyNotified) return; // only notify the first time this user likes this post
        notificationRepository.save(new Notification(recipient, actor, NotificationType.LIKE, postId, null));
    }

    @Transactional
    public void notifyComment(User actor, User recipient, Long postId, Long commentId) {
        if (actor.getId().equals(recipient.getId())) return; // don't notify yourself
        notificationRepository.save(new Notification(recipient, actor, NotificationType.COMMENT, postId, commentId));
    }

    @Transactional(readOnly = true)
    public Page<NotificationDto> getNotifications(User recipient, Pageable pageable) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(recipient, pageable)
                .map(n -> new NotificationDto(
                        n.getId(),
                        n.getActor().getUsername(),
                        n.getActor().getAvatarUrl(),
                        n.getType(),
                        n.getPostId(),
                        n.getCommentId(),
                        n.isRead(),
                        n.getCreatedAt()
                ));
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User recipient) {
        return notificationRepository.countByRecipientAndReadFalse(recipient);
    }

    @Transactional
    public void markAllAsRead(User recipient) {
        var unread = notificationRepository.findByRecipientOrderByCreatedAtDesc(recipient, Pageable.unpaged())
                .filter(n -> !n.isRead())
                .toList();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}