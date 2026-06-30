package com.bajram.socialapi.follow;

import com.bajram.socialapi.user.User;

public class UserSummaryResponse {
    private Long id;
    private String username;

    public UserSummaryResponse(Long id, String username) {
        this.id = id;
        this.username = username;
    }

    public static UserSummaryResponse fromEntity(User user) {
        return new UserSummaryResponse(user.getId(), user.getUsername());
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }
}