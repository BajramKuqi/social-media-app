package com.bajram.socialapi.like;

public class LikeResponse {
    private String username;

    public LikeResponse(String username) {
        this.username = username;
    }

    public static LikeResponse fromEntity(Like like) {
        return new LikeResponse(like.getUser().getUsername());
    }

    public String getUsername() {
        return username;
    }
}