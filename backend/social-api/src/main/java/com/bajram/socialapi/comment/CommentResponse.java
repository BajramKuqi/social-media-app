package com.bajram.socialapi.comment;

import java.time.Instant;

public class CommentResponse {
    private Long id;
    private String content;
    private String authorUsername;
    private Instant createdAt;

    public CommentResponse(Long id, String content, String authorUsername, Instant createdAt) {
        this.id = id;
        this.content = content;
        this.authorUsername = authorUsername;
        this.createdAt = createdAt;
    }

    public static CommentResponse fromEntity(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getUser().getUsername(),
                comment.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public String getAuthorUsername() {
        return authorUsername;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}