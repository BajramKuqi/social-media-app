package com.bajram.socialapi.message;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByConversationOrderByCreatedAtDesc(Conversation conversation, Pageable pageable);

    List<Message> findByConversationAndIdGreaterThanOrderByCreatedAtAsc(Conversation conversation, Long afterId);

    Optional<Message> findTopByConversationOrderByCreatedAtDesc(Conversation conversation);

    Page<Message> findByConversationAndCreatedAtAfterOrderByCreatedAtDesc(
            Conversation conversation, Instant after, Pageable pageable);
}