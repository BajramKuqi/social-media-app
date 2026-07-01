package com.bajram.socialapi.story;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface StoryRepository extends JpaRepository<Story, Long> {

    @Query("SELECT s FROM Story s WHERE s.expiresAt > :now AND s.author.id = :authorId ORDER BY s.createdAt ASC")
    List<Story> findActiveByAuthorId(@Param("authorId") Long authorId, @Param("now") Instant now);

    @Query("SELECT s FROM Story s WHERE s.expiresAt > :now AND s.author.id IN :authorIds ORDER BY s.createdAt ASC")
    List<Story> findActiveByAuthorIdIn(@Param("authorIds") List<Long> authorIds, @Param("now") Instant now);
}
