package com.bajram.socialapi.post;

import java.time.Instant;

public class PostResponse {

    private Long id;
    private String caption;
    private String imageUrl;
    private String authorUsername;
    private Instant createdAt;

    public PostResponse(Long id, String caption, String imageUrl, String authorUsername, Instant createdAt) {
        this.id = id;
        this.caption = caption;
        this.imageUrl = imageUrl;
        this.authorUsername = authorUsername;
        this.createdAt = createdAt;
    }

    public static PostResponse fromEntity(Post post) {
        return new PostResponse(
                post.getId(),
                post.getCaption(),
                post.getImageUrl(),
                post.getAuthor().getUsername(),
                post.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public String getCaption() {
        return caption;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getAuthorUsername() {
        return authorUsername;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}