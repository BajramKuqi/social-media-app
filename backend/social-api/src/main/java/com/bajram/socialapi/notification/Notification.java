package com.bajram.socialapi.notification;

import com.bajram.socialapi.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notif_recipient_created", columnList = "recipient_id, created_at DESC"),
        @Index(name = "idx_notif_recipient_read", columnList = "recipient_id, is_read")
})
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationType type;

    @Column(name = "post_id")
    private Long postId;

    @Column(name = "reel_id")
    private Long reelId;

    @Column(name = "comment_id")
    private Long commentId;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Notification() {}

    public Notification(User recipient, User actor, NotificationType type, Long postId, Long commentId) {
        this.recipient = recipient;
        this.actor = actor;
        this.type = type;
        this.postId = postId;
        this.commentId = commentId;
    }

    public Notification(User recipient, User actor, NotificationType type, Long postId, Long reelId, Long commentId) {
        this.recipient = recipient;
        this.actor = actor;
        this.type = type;
        this.postId = postId;
        this.reelId = reelId;
        this.commentId = commentId;
    }

    public Long getId() { return id; }
    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }
    public User getActor() { return actor; }
    public void setActor(User actor) { this.actor = actor; }
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }
    public Long getReelId() { return reelId; }
    public void setReelId(Long reelId) { this.reelId = reelId; }
    public Long getCommentId() { return commentId; }
    public void setCommentId(Long commentId) { this.commentId = commentId; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public Instant getCreatedAt() { return createdAt; }
}