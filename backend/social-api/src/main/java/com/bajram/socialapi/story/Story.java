package com.bajram.socialapi.story;

import com.bajram.socialapi.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "stories")
public class Story {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "media_url", nullable = false)
    private String mediaUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false)
    private MediaType mediaType;

    @Column(length = 500)
    private String caption;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.expiresAt = this.createdAt.plusSeconds(24 * 60 * 60);
    }

    public enum MediaType {
        IMAGE, VIDEO
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

    public MediaType getMediaType() { return mediaType; }
    public void setMediaType(MediaType mediaType) { this.mediaType = mediaType; }

    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
}
