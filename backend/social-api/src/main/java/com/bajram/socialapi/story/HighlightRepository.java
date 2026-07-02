package com.bajram.socialapi.story;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HighlightRepository extends JpaRepository<Highlight, Long> {
    List<Highlight> findByOwnerIdOrderByCreatedAtAsc(Long ownerId);
    Optional<Highlight> findByIdAndOwnerId(Long id, Long ownerId);
}