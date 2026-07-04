package com.bajram.socialapi.reel;

import java.time.Instant;

public class ReelResponse {
    private Long id;
    private String caption;
    private String videoUrl;
    private String thumbnailUrl;
    private Integer durationSeconds;
    private String authorUsername;
    private Instant createdAt;
    private long likeCount;
    private boolean likedByCurrentUser;
    private long commentCount;

    public ReelResponse(Long id, String caption, String videoUrl, String thumbnailUrl, Integer durationSeconds,
                        String authorUsername, Instant createdAt, long likeCount,
                        boolean likedByCurrentUser, long commentCount) {
        this.id = id;
        this.caption = caption;
        this.videoUrl = videoUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.durationSeconds = durationSeconds;
        this.authorUsername = authorUsername;
        this.createdAt = createdAt;
        this.likeCount = likeCount;
        this.likedByCurrentUser = likedByCurrentUser;
        this.commentCount = commentCount;
    }

    public static ReelResponse fromEntity(Reel reel, long likeCount, boolean likedByCurrentUser, long commentCount) {
        return new ReelResponse(
                reel.getId(),
                reel.getCaption(),
                reel.getVideoUrl(),
                reel.getThumbnailUrl(),
                reel.getDurationSeconds(),
                reel.getAuthor().getUsername(),
                reel.getCreatedAt(),
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

    public String getVideoUrl() {
        return videoUrl;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
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