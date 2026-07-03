package com.bajram.socialapi.message;

import com.bajram.socialapi.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final MessageRepository messageRepository;

    public ConversationService(ConversationRepository conversationRepository,
                               ConversationParticipantRepository participantRepository,
                               MessageRepository messageRepository) {
        this.conversationRepository = conversationRepository;
        this.participantRepository = participantRepository;
        this.messageRepository = messageRepository;
    }

    @Transactional
    public Conversation getOrCreateDirectConversation(User userA, User userB) {
        return conversationRepository.findDirectConversationBetween(userA, userB)
                .orElseGet(() -> {
                    Conversation conversation = conversationRepository.save(new Conversation(false, null));
                    participantRepository.save(new ConversationParticipant(conversation, userA));
                    participantRepository.save(new ConversationParticipant(conversation, userB));
                    return conversation;
                });
    }

    @Transactional
    public Conversation createGroupConversation(User creator, List<User> otherMembers, String name) {
        Conversation conversation = conversationRepository.save(new Conversation(true, name));
        participantRepository.save(new ConversationParticipant(conversation, creator));
        for (User member : otherMembers) {
            if (!member.getId().equals(creator.getId())) {
                participantRepository.save(new ConversationParticipant(conversation, member));
            }
        }
        return conversation;
    }

    public boolean isParticipant(Conversation conversation, User user) {
        return participantRepository.existsByConversationAndUser(conversation, user);
    }

    @Transactional
    public MessageDto sendMessage(Conversation conversation, User sender, String content) {
        Message saved = messageRepository.save(new Message(conversation, sender, content));
        participantRepository.findByConversationAndUser(conversation, sender).ifPresent(p -> {
            p.setLastReadAt(saved.getCreatedAt());
            participantRepository.save(p);
        });
        return MessageDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public Page<MessageDto> getMessages(Conversation conversation, User currentUser, Pageable pageable) {
        ConversationParticipant participant = participantRepository.findByConversationAndUser(conversation, currentUser)
                .orElseThrow(() -> new RuntimeException("Not a participant"));
        if (participant.getClearedAt() != null) {
            return messageRepository
                    .findByConversationAndCreatedAtAfterOrderByCreatedAtDesc(conversation, participant.getClearedAt(), pageable)
                    .map(MessageDto::fromEntity);
        }
        return messageRepository.findByConversationOrderByCreatedAtDesc(conversation, pageable)
                .map(MessageDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<MessageDto> getMessagesSince(Conversation conversation, Long afterId) {
        return messageRepository.findByConversationAndIdGreaterThanOrderByCreatedAtAsc(conversation, afterId)
                .stream().map(MessageDto::fromEntity).toList();
    }

    @Transactional
    public void markAsRead(Conversation conversation, User user) {
        ConversationParticipant participant = participantRepository.findByConversationAndUser(conversation, user)
                .orElseThrow(() -> new RuntimeException("Not a participant"));
        participant.setLastReadAt(Instant.now());
        participantRepository.save(participant);
    }

    @Transactional(readOnly = true)
    public List<ConversationSummaryDto> getConversationsForUser(User user) {
        List<ConversationParticipant> memberships = participantRepository.findByUser(user);

        return memberships.stream()
                .map(membership -> toSummary(membership, user))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .sorted(Comparator.comparing(ConversationSummaryDto::getLastMessageAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }
    @Transactional(readOnly = true)
    public long getUnreadConversationCount(User user) {
        List<ConversationParticipant> memberships = participantRepository.findByUser(user);
        long count = 0;
        for (ConversationParticipant m : memberships) {
            Optional<Message> lastMessage = messageRepository.findTopByConversationOrderByCreatedAtDesc(m.getConversation());
            if (lastMessage.isEmpty()) continue;
            boolean unread = m.getLastReadAt() == null || m.getLastReadAt().isBefore(lastMessage.get().getCreatedAt());
            if (unread) count++;
        }
        return count;
    }
    @Transactional
    public void deleteMessage(Long messageId, User currentUser) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        if (!message.getSender().getId().equals(currentUser.getId())) {
            throw new SecurityException("Not authorized to delete this message");
        }
        messageRepository.delete(message);
    }

    @Transactional
    public void clearConversationForUser(Conversation conversation, User user) {
        ConversationParticipant participant = participantRepository.findByConversationAndUser(conversation, user)
                .orElseThrow(() -> new RuntimeException("Not a participant"));
        participant.setClearedAt(Instant.now());
        participantRepository.save(participant);
    }

    @Transactional
    public boolean exitGroup(Conversation conversation, User user) {
        if (!conversation.isGroup()) {
            throw new IllegalStateException("Cannot exit a direct conversation");
        }
        ConversationParticipant participant = participantRepository.findByConversationAndUser(conversation, user)
                .orElseThrow(() -> new RuntimeException("Not a participant"));
        participantRepository.delete(participant);

        long remaining = participantRepository.findByConversation(conversation).size();
        if (remaining == 0) {
            messageRepository.deleteByConversation(conversation);
            conversationRepository.delete(conversation);
            return true;
        }
        createSystemMessage(conversation, user, user.getUsername() + " left the group");
        return false;
    }

    @Transactional
    public void addMemberToGroup(Conversation conversation, User currentUser, User newMember) {
        if (!conversation.isGroup()) {
            throw new IllegalStateException("Cannot add members to a direct conversation");
        }
        if (!isParticipant(conversation, currentUser)) {
            throw new SecurityException("Not authorized");
        }
        if (isParticipant(conversation, newMember)) {
            return;
        }
        participantRepository.save(new ConversationParticipant(conversation, newMember));
        createSystemMessage(conversation, currentUser, currentUser.getUsername() + " added " + newMember.getUsername());
    }

    @Transactional
    public MessageDto createSystemMessage(Conversation conversation, User actingUser, String content) {
        Message saved = messageRepository.save(new Message(conversation, actingUser, content, MessageType.SYSTEM));
        return MessageDto.fromEntity(saved);
    }

    private Optional<ConversationSummaryDto> toSummary(ConversationParticipant membership, User currentUser) {
        Conversation conversation = membership.getConversation();
        Optional<Message> lastMessage = messageRepository.findTopByConversationOrderByCreatedAtDesc(conversation);

        // hide empty direct conversations with no messages yet from the list (Instagram behavior:
        // a thread only appears once a message has actually been sent)
        if (lastMessage.isEmpty()) return Optional.empty();
        if (membership.getClearedAt() != null && !lastMessage.get().getCreatedAt().isAfter(membership.getClearedAt())) {
            return Optional.empty();
        }

        String displayName;
        String avatarUrl;
        if (conversation.isGroup()) {
            displayName = conversation.getName() != null ? conversation.getName() : "Group";
            avatarUrl = null;
        } else {
            User other = participantRepository.findByConversation(conversation).stream()
                    .map(ConversationParticipant::getUser)
                    .filter(u -> !u.getId().equals(currentUser.getId()))
                    .findFirst()
                    .orElse(currentUser);
            displayName = other.getUsername();
            avatarUrl = other.getAvatarUrl();
        }

        boolean unread = membership.getLastReadAt() == null
                || membership.getLastReadAt().isBefore(lastMessage.get().getCreatedAt());

        String preview = lastMessage.get().getContent();
        if (preview.length() > 60) preview = preview.substring(0, 60) + "...";

        return Optional.of(new ConversationSummaryDto(
                conversation.getId(),
                conversation.isGroup(),
                displayName,
                avatarUrl,
                preview,
                lastMessage.get().getSender().getUsername(),
                lastMessage.get().getCreatedAt(),
                unread
        ));
    }
}