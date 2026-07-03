package com.bajram.socialapi.like;

import com.bajram.socialapi.post.Post;
import com.bajram.socialapi.post.PostRepository;
import com.bajram.socialapi.user.User;
import com.bajram.socialapi.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;
import com.bajram.socialapi.notification.NotificationService;

@RestController
@RequestMapping("/posts/{postId}/like")
public class LikeController {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public LikeController(LikeRepository likeRepository, PostRepository postRepository,
                          UserRepository userRepository, NotificationService notificationService) {
        this.likeRepository = likeRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @PostMapping
    public ResponseEntity<Void> likePost(@PathVariable Long postId) {
        User currentUser = getCurrentUser();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (likeRepository.existsByUserAndPost(currentUser, post)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        likeRepository.save(new Like(currentUser, post));
        notificationService.notifyLike(currentUser, post.getAuthor(), postId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    @GetMapping
    public ResponseEntity<List<LikeResponse>> getLikes(@PathVariable Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        List<LikeResponse> likes = likeRepository.findByPost(post).stream()
                .map(LikeResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(likes);
    }

    @DeleteMapping
    public ResponseEntity<Void> unlikePost(@PathVariable Long postId) {
        User currentUser = getCurrentUser();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Like like = likeRepository.findByUserAndPost(currentUser, post)
                .orElseThrow(() -> new RuntimeException("Like not found"));

        likeRepository.delete(like);
        return ResponseEntity.noContent().build();
    }
}