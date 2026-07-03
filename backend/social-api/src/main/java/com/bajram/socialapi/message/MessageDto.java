package com.bajram.socialapi.message;
import java.time.Instant;
public class MessageDto {
    private Long id;
    private Long conversationId;
    private String senderUsername;
    private String senderAvatarUrl;
    private String content;
    private Instant createdAt;
    private String type;

    public MessageDto(Long id, Long conversationId, String senderUsername, String senderAvatarUrl,
                      String content, Instant createdAt, String type) {
        this.id = id;
        this.conversationId = conversationId;
        this.senderUsername = senderUsername;
        this.senderAvatarUrl = senderAvatarUrl;
        this.content = content;
        this.createdAt = createdAt;
        this.type = type;
    }
    public static MessageDto fromEntity(Message m) {
        return new MessageDto(
                m.getId(),
                m.getConversation().getId(),
                m.getSender().getUsername(),
                m.getSender().getAvatarUrl(),
                m.getContent(),
                m.getCreatedAt(),
                m.getType().name()
        );
    }
    public Long getId() { return id; }
    public Long getConversationId() { return conversationId; }
    public String getSenderUsername() { return senderUsername; }
    public String getSenderAvatarUrl() { return senderAvatarUrl; }
    public String getContent() { return content; }
    public Instant getCreatedAt() { return createdAt; }
    public String getType() { return type; }
}