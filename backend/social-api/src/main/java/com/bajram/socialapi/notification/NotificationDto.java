package com.bajram.socialapi.notification;

import java.time.Instant;

public class NotificationDto {
    private Long id;
    private String actorUsername;
    private String actorAvatarUrl;
    private NotificationType type;
    private Long postId;
    private Long commentId;
    private boolean read;
    private Instant createdAt;

    public NotificationDto(Long id, String actorUsername, String actorAvatarUrl, NotificationType type,
                           Long postId, Long commentId, boolean read, Instant createdAt) {
        this.id = id;
        this.actorUsername = actorUsername;
        this.actorAvatarUrl = actorAvatarUrl;
        this.type = type;
        this.postId = postId;
        this.commentId = commentId;
        this.read = read;
        this.createdAt = createdAt;
    }

    // getters
    public Long getId() { return id; }
    public String getActorUsername() { return actorUsername; }
    public String getActorAvatarUrl() { return actorAvatarUrl; }
    public NotificationType getType() { return type; }
    public Long getPostId() { return postId; }
    public Long getCommentId() { return commentId; }
    public boolean isRead() { return read; }
    public Instant getCreatedAt() { return createdAt; }
}