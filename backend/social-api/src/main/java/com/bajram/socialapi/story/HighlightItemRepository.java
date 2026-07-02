
package com.bajram.socialapi.story;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface HighlightItemRepository extends JpaRepository<HighlightItem, Long> {
    boolean existsByHighlightIdAndStoryId(Long highlightId, Long storyId);
    List<HighlightItem> findByHighlightIdOrderByAddedAtAsc(Long highlightId);
    long countByHighlightId(Long highlightId);

    @Transactional
    void deleteByStoryId(Long storyId);

    @Transactional
    void deleteByHighlightId(Long highlightId);
}