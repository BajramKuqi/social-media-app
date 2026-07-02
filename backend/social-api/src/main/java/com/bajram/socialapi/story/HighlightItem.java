package com.bajram.socialapi.story;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "highlight_items", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"highlight_id", "story_id"})
})
public class HighlightItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "highlight_id", nullable = false)
    private Highlight highlight;

    @Column(name = "story_id", nullable = false)
    private Long storyId;

    @Column(name = "media_url", nullable = false)
    private String mediaUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false)
    private Story.MediaType mediaType;

    @Column(length = 500)
    private String caption;

    @Column(name = "added_at", nullable = false, updatable = false)
    private Instant addedAt;

    @PrePersist
    protected void onCreate() {
        this.addedAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Highlight getHighlight() { return highlight; }
    public void setHighlight(Highlight highlight) { this.highlight = highlight; }
    public Long getStoryId() { return storyId; }
    public void setStoryId(Long storyId) { this.storyId = storyId; }
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public Story.MediaType getMediaType() { return mediaType; }
    public void setMediaType(Story.MediaType mediaType) { this.mediaType = mediaType; }
    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }
    public Instant getAddedAt() { return addedAt; }
}