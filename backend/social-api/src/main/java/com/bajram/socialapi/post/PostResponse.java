package com.bajram.socialapi.post;

import java.time.Instant;

public class PostResponse {
    private Long id;
    private String caption;
    private String imageUrl;
    private String authorUsername;
    private Instant createdAt;
    private long likeCount;
    private boolean likedByCurrentUser;
    private long commentCount;

    public PostResponse(Long id, String caption, String imageUrl, String authorUsername,
                        Instant createdAt, long likeCount, boolean likedByCurrentUser, long commentCount) {
        this.id = id;
        this.caption = caption;
        this.imageUrl = imageUrl;
        this.authorUsername = authorUsername;
        this.createdAt = createdAt;
        this.likeCount = likeCount;
        this.likedByCurrentUser = likedByCurrentUser;
        this.commentCount = commentCount;
    }

    public static PostResponse fromEntity(Post post, long likeCount, boolean likedByCurrentUser, long commentCount) {
        return new PostResponse(
                post.getId(),
                post.getCaption(),
                post.getImageUrl(),
                post.getAuthor().getUsername(),
                post.getCreatedAt(),
                likeCount,
                likedByCurrentUser,
                commentCount
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

    public long getLikeCount() {
        return likeCount;
    }

    public boolean isLikedByCurrentUser() {
        return likedByCurrentUser;
    }

    public long getCommentCount() {
        return commentCount;
    }
}