package com.bajram.socialapi.reel;

import com.bajram.socialapi.comment.Comment;
import com.bajram.socialapi.comment.CommentRepository;
import com.bajram.socialapi.comment.CommentResponse;
import com.bajram.socialapi.comment.CreateCommentRequest;
import com.bajram.socialapi.notification.NotificationService;
import com.bajram.socialapi.user.User;
import com.bajram.socialapi.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reels/{reelId}/comments")
public class ReelCommentController {
    private final CommentRepository commentRepository;
    private final ReelRepository reelRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ReelCommentController(CommentRepository commentRepository, ReelRepository reelRepository,
                                 UserRepository userRepository, NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.reelRepository = reelRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long reelId,
            @Valid @RequestBody CreateCommentRequest request) {
        User author = getCurrentUser();
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new RuntimeException("Reel not found"));
        Comment comment = new Comment(request.getContent(), author, reel);
        Comment saved = commentRepository.save(comment);
        notificationService.notifyReelComment(author, reel.getAuthor(), reelId, saved.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(CommentResponse.fromEntity(saved));
    }

    @GetMapping
    public ResponseEntity<Page<CommentResponse>> getComments(
            @PathVariable Long reelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new RuntimeException("Reel not found"));
        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> comments = commentRepository.findByReelOrderByCreatedAtDesc(reel, pageable);
        Page<CommentResponse> response = comments.map(CommentResponse::fromEntity);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long reelId, @PathVariable Long commentId) {
        User currentUser = getCurrentUser();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        boolean isCommentAuthor = comment.getUser().getId().equals(currentUser.getId());
        boolean isReelOwner = comment.getReel() != null
                && comment.getReel().getAuthor().getId().equals(currentUser.getId());
        if (!isCommentAuthor && !isReelOwner) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        commentRepository.delete(comment);
        return ResponseEntity.noContent().build();
    }
}