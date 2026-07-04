package com.bajram.socialapi.reel;

import com.bajram.socialapi.like.Like;
import com.bajram.socialapi.like.LikeRepository;
import com.bajram.socialapi.like.LikeResponse;
import com.bajram.socialapi.notification.NotificationService;
import com.bajram.socialapi.user.User;
import com.bajram.socialapi.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reels/{reelId}/like")
public class ReelLikeController {
    private final LikeRepository likeRepository;
    private final ReelRepository reelRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ReelLikeController(LikeRepository likeRepository, ReelRepository reelRepository,
                              UserRepository userRepository, NotificationService notificationService) {
        this.likeRepository = likeRepository;
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
    public ResponseEntity<Void> likeReel(@PathVariable Long reelId) {
        User currentUser = getCurrentUser();
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new RuntimeException("Reel not found"));
        if (likeRepository.existsByUserAndReel(currentUser, reel)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        likeRepository.save(new Like(currentUser, reel));
        notificationService.notifyReelLike(currentUser, reel.getAuthor(), reelId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    public ResponseEntity<List<LikeResponse>> getLikes(@PathVariable Long reelId) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new RuntimeException("Reel not found"));
        List<LikeResponse> likes = likeRepository.findByReel(reel).stream()
                .map(LikeResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(likes);
    }

    @DeleteMapping
    public ResponseEntity<Void> unlikeReel(@PathVariable Long reelId) {
        User currentUser = getCurrentUser();
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new RuntimeException("Reel not found"));
        Like like = likeRepository.findByUserAndReel(currentUser, reel)
                .orElseThrow(() -> new RuntimeException("Like not found"));
        likeRepository.delete(like);
        return ResponseEntity.noContent().build();
    }
}