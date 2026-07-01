package com.bajram.socialapi.story;

import java.util.List;

public class StoryFeedGroupResponse {
    private Long authorId;
    private String authorUsername;
    private String authorAvatarUrl;
    private boolean hasUnseenStories;
    private List<StoryResponse> stories;

    public StoryFeedGroupResponse(Long authorId, String authorUsername, String authorAvatarUrl,
                                   boolean hasUnseenStories, List<StoryResponse> stories) {
        this.authorId = authorId;
        this.authorUsername = authorUsername;
        this.authorAvatarUrl = authorAvatarUrl;
        this.hasUnseenStories = hasUnseenStories;
        this.stories = stories;
    }

    public Long getAuthorId() { return authorId; }
    public String getAuthorUsername() { return authorUsername; }
    public String getAuthorAvatarUrl() { return authorAvatarUrl; }
    public boolean isHasUnseenStories() { return hasUnseenStories; }
    public List<StoryResponse> getStories() { return stories; }
}
