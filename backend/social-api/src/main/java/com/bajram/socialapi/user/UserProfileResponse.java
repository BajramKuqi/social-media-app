package com.bajram.socialapi.user;

public class UserProfileResponse {
    private Long id;
    private String username;
    private String avatarUrl;
    private long postCount;
    private long reelCount;
    private long followerCount;
    private long followingCount;
    private boolean followedByCurrentUser;

    public UserProfileResponse(Long id, String username, String avatarUrl, long postCount, long reelCount,
                               long followerCount, long followingCount,
                               boolean followedByCurrentUser) {
        this.id = id;
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.postCount = postCount;
        this.reelCount = reelCount;
        this.followerCount = followerCount;
        this.followingCount = followingCount;
        this.followedByCurrentUser = followedByCurrentUser;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getAvatarUrl() { return avatarUrl; }
    public long getPostCount() { return postCount; }
    public long getReelCount() { return reelCount; }
    public long getFollowerCount() { return followerCount; }
    public long getFollowingCount() { return followingCount; }
    public boolean isFollowedByCurrentUser() { return followedByCurrentUser; }
}