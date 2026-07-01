package com.bajram.socialapi.story;

import java.time.Instant;

public class StoryViewResponse {
    private Long viewerId;
    private String viewerUsername;
    private String viewerAvatarUrl;
    private Instant viewedAt;

    public static StoryViewResponse from(StoryView view) {
        StoryViewResponse dto = new StoryViewResponse();
        dto.viewerId = view.getViewer().getId();
        dto.viewerUsername = view.getViewer().getUsername();
        dto.viewerAvatarUrl = view.getViewer().getAvatarUrl();
        dto.viewedAt = view.getViewedAt();
        return dto;
    }

    public Long getViewerId() { return viewerId; }
    public String getViewerUsername() { return viewerUsername; }
    public String getViewerAvatarUrl() { return viewerAvatarUrl; }
    public Instant getViewedAt() { return viewedAt; }
}
