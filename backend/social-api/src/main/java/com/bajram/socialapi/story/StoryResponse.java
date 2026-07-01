package com.bajram.socialapi.story;

import java.time.Instant;

public class StoryResponse {
    private Long id;
    private Long authorId;
    private String authorUsername;
    private String authorAvatarUrl;
    private String mediaUrl;
    private Story.MediaType mediaType;
    private String caption;
    private Instant createdAt;
    private Instant expiresAt;
    private boolean viewedByCurrentUser;

    public static StoryResponse from(Story story, boolean viewedByCurrentUser) {
        StoryResponse dto = new StoryResponse();
        dto.id = story.getId();
        dto.authorId = story.getAuthor().getId();
        dto.authorUsername = story.getAuthor().getUsername();
        dto.authorAvatarUrl = story.getAuthor().getAvatarUrl();
        dto.mediaUrl = story.getMediaUrl();
        dto.mediaType = story.getMediaType();
        dto.caption = story.getCaption();
        dto.createdAt = story.getCreatedAt();
        dto.expiresAt = story.getExpiresAt();
        dto.viewedByCurrentUser = viewedByCurrentUser;
        return dto;
    }

    public Long getId() { return id; }
    public Long getAuthorId() { return authorId; }
    public String getAuthorUsername() { return authorUsername; }
    public String getAuthorAvatarUrl() { return authorAvatarUrl; }
    public String getMediaUrl() { return mediaUrl; }
    public Story.MediaType getMediaType() { return mediaType; }
    public String getCaption() { return caption; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public boolean isViewedByCurrentUser() { return viewedByCurrentUser; }
}
