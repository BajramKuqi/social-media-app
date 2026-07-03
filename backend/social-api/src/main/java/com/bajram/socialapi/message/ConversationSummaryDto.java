package com.bajram.socialapi.message;

import java.time.Instant;

public class ConversationSummaryDto {
    private Long id;
    private boolean group;
    private String displayName;
    private String avatarUrl;
    private String lastMessagePreview;
    private String lastMessageSenderUsername;
    private Instant lastMessageAt;
    private boolean unread;

    public ConversationSummaryDto(Long id, boolean group, String displayName, String avatarUrl,
                                  String lastMessagePreview, String lastMessageSenderUsername,
                                  Instant lastMessageAt, boolean unread) {
        this.id = id;
        this.group = group;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
        this.lastMessagePreview = lastMessagePreview;
        this.lastMessageSenderUsername = lastMessageSenderUsername;
        this.lastMessageAt = lastMessageAt;
        this.unread = unread;
    }

    public Long getId() { return id; }
    public boolean isGroup() { return group; }
    public String getDisplayName() { return displayName; }
    public String getAvatarUrl() { return avatarUrl; }
    public String getLastMessagePreview() { return lastMessagePreview; }
    public String getLastMessageSenderUsername() { return lastMessageSenderUsername; }
    public Instant getLastMessageAt() { return lastMessageAt; }
    public boolean isUnread() { return unread; }
}