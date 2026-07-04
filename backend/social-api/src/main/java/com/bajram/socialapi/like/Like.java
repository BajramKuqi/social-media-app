package com.bajram.socialapi.like;

import com.bajram.socialapi.post.Post;
import com.bajram.socialapi.reel.Reel;
import com.bajram.socialapi.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "likes")
public class Like {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reel_id")
    private Reel reel;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Like() {
    }

    public Like(User user, Post post) {
        this.user = user;
        this.post = post;
        this.createdAt = Instant.now();
    }

    public Like(User user, Reel reel) {
        this.user = user;
        this.reel = reel;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public Reel getReel() {
        return reel;
    }

    public void setReel(Reel reel) {
        this.reel = reel;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}