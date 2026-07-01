package com.bajram.socialapi.story;

import com.bajram.socialapi.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "story_views", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"story_id", "viewer_id"})
})
public class StoryView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "story_id", nullable = false)
    private Story story;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viewer_id", nullable = false)
    private User viewer;

    @Column(name = "viewed_at", nullable = false, updatable = false)
    private Instant viewedAt;

    @PrePersist
    protected void onCreate() {
        this.viewedAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Story getStory() { return story; }
    public void setStory(Story story) { this.story = story; }

    public User getViewer() { return viewer; }
    public void setViewer(User viewer) { this.viewer = viewer; }

    public Instant getViewedAt() { return viewedAt; }
}
