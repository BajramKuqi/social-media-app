package com.bajram.socialapi.message;

import com.bajram.socialapi.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE c.isGroup = false AND c.id IN " +
            "(SELECT cp1.conversation.id FROM ConversationParticipant cp1 WHERE cp1.user = :userA) " +
            "AND c.id IN (SELECT cp2.conversation.id FROM ConversationParticipant cp2 WHERE cp2.user = :userB)")
    Optional<Conversation> findDirectConversationBetween(@Param("userA") User userA, @Param("userB") User userB);
}