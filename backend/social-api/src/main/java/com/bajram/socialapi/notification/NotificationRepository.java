package com.bajram.socialapi.notification;

import com.bajram.socialapi.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable);
    long countByRecipientAndReadFalse(User recipient);
    boolean existsByActorAndRecipientAndPostIdAndType(User actor, User recipient, Long postId, NotificationType type);
    boolean existsByActorAndRecipientAndReelIdAndType(User actor, User recipient, Long reelId, NotificationType type);
    boolean existsByActorAndRecipientAndType(User actor, User recipient, NotificationType type);
}