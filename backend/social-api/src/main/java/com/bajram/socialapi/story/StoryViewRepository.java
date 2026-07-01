package com.bajram.socialapi.story;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoryViewRepository extends JpaRepository<StoryView, Long> {

    boolean existsByStoryIdAndViewerId(Long storyId, Long viewerId);

    Optional<StoryView> findByStoryIdAndViewerId(Long storyId, Long viewerId);

    List<StoryView> findByStoryIdOrderByViewedAtDesc(Long storyId);

    long countByStoryId(Long storyId);
}
