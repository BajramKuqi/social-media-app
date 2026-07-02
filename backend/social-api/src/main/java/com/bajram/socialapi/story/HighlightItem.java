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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "story_id", nullable = false)
    private Story story;

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
    public Story getStory() { return story; }
    public void setStory(Story story) { this.story = story; }
    public Instant getAddedAt() { return addedAt; }
}