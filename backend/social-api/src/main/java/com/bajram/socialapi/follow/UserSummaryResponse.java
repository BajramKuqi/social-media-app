package com.bajram.socialapi.follow;

import com.bajram.socialapi.user.User;

public class UserSummaryResponse {
    private Long id;
    private String username;
    private String avatarUrl;
    private boolean followedByCurrentUser;

    public UserSummaryResponse(Long id, String username, String avatarUrl, boolean followedByCurrentUser) {
        this.id = id;
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.followedByCurrentUser = followedByCurrentUser;
    }

    public static UserSummaryResponse fromEntity(User user) {
        return new UserSummaryResponse(user.getId(), user.getUsername(), user.getAvatarUrl(), false);
    }

    public static UserSummaryResponse fromEntity(User user, boolean followedByCurrentUser) {
        return new UserSummaryResponse(user.getId(), user.getUsername(), user.getAvatarUrl(), followedByCurrentUser);
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public boolean isFollowedByCurrentUser() {
        return followedByCurrentUser;
    }
}