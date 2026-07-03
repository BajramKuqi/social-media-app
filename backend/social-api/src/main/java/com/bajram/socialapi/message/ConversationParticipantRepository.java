package com.bajram.socialapi.message;

import com.bajram.socialapi.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {

    List<ConversationParticipant> findByUser(User user);

    Optional<ConversationParticipant> findByConversationAndUser(Conversation conversation, User user);

    boolean existsByConversationAndUser(Conversation conversation, User user);

    List<ConversationParticipant> findByConversation(Conversation conversation);
}