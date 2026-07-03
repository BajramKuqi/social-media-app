package com.bajram.socialapi.message;

import com.bajram.socialapi.user.User;
import com.bajram.socialapi.user.UserRepository;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/conversations")
public class ConversationController {

    private final ConversationService conversationService;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    public ConversationController(ConversationService conversationService,
                                  ConversationRepository conversationRepository,
                                  UserRepository userRepository) {
        this.conversationService = conversationService;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    private Conversation getConversationOrThrow(Long id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
    }

    public record SendMessageRequest(@NotBlank String content) {}
    public record CreateGroupRequest(@NotBlank String name, List<Long> memberUserIds) {}

    @GetMapping
    public ResponseEntity<List<ConversationSummaryDto>> getConversations() {
        return ResponseEntity.ok(conversationService.getConversationsForUser(getCurrentUser()));
    }

    @PostMapping("/group")
    public ResponseEntity<Map<String, Long>> createGroup(@RequestBody CreateGroupRequest request) {
        User creator = getCurrentUser();
        List<User> members = request.memberUserIds().stream()
                .map(id -> userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found")))
                .toList();
        Conversation conversation = conversationService.createGroupConversation(creator, members, request.name());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("conversationId", conversation.getId()));
    }

    // Starts (or reuses) a direct conversation and sends the first/next message in one call.
    @PostMapping("/direct/{userId}/messages")
    public ResponseEntity<MessageDto> sendDirectMessage(@PathVariable Long userId,
                                                        @RequestBody SendMessageRequest request) {
        User currentUser = getCurrentUser();
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (currentUser.getId().equals(targetUser.getId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        Conversation conversation = conversationService.getOrCreateDirectConversation(currentUser, targetUser);
        MessageDto saved = conversationService.sendMessage(conversation, currentUser, request.content());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<MessageDto> sendMessage(@PathVariable Long conversationId,
                                                  @RequestBody SendMessageRequest request) {
        User currentUser = getCurrentUser();
        Conversation conversation = getConversationOrThrow(conversationId);
        if (!conversationService.isParticipant(conversation, currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        MessageDto saved = conversationService.sendMessage(conversation, currentUser, request.content());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<Page<MessageDto>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        User currentUser = getCurrentUser();
        Conversation conversation = getConversationOrThrow(conversationId);
        if (!conversationService.isParticipant(conversation, currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(conversationService.getMessages(conversation, currentUser, pageable));
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long messageId) {
        try {
            conversationService.deleteMessage(messageId, getCurrentUser());
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/{conversationId}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long conversationId) {
        User currentUser = getCurrentUser();
        Conversation conversation = getConversationOrThrow(conversationId);
        if (!conversationService.isParticipant(conversation, currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        conversationService.clearConversationForUser(conversation, currentUser);
        return ResponseEntity.noContent().build();
    }

    // lightweight poll: only messages newer than afterId, for fast refresh of an open chat
    @GetMapping("/{conversationId}/messages/poll")
    public ResponseEntity<List<MessageDto>> pollMessages(
            @PathVariable Long conversationId,
            @RequestParam Long afterId) {
        User currentUser = getCurrentUser();
        Conversation conversation = getConversationOrThrow(conversationId);
        if (!conversationService.isParticipant(conversation, currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(conversationService.getMessagesSince(conversation, afterId));
    }

    @PostMapping("/{conversationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long conversationId) {
        User currentUser = getCurrentUser();
        Conversation conversation = getConversationOrThrow(conversationId);
        if (!conversationService.isParticipant(conversation, currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        conversationService.markAsRead(conversation, currentUser);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/direct/{userId}")
    public ResponseEntity<ConversationSummaryDto> getDirectConversation(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return conversationRepository.findDirectConversationBetween(currentUser, targetUser)
                .flatMap(conversation -> conversationService.getConversationsForUser(currentUser).stream()
                        .filter(c -> c.getId().equals(conversation.getId()))
                        .findFirst())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        return ResponseEntity.ok(Map.of("count", conversationService.getUnreadConversationCount(getCurrentUser())));
    }
}