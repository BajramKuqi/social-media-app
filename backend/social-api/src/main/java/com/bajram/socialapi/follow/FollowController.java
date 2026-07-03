package com.bajram.socialapi.follow;

import com.bajram.socialapi.user.User;
import com.bajram.socialapi.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.bajram.socialapi.notification.NotificationService;

@RestController
@RequestMapping("/users/{userId}")
public class FollowController {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public FollowController(FollowRepository followRepository, UserRepository userRepository,
                            NotificationService notificationService) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @PostMapping("/follow")
    public ResponseEntity<Void> followUser(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getId().equals(targetUser.getId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        if (followRepository.existsByFollowerAndFollowing(currentUser, targetUser)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        followRepository.save(new Follow(currentUser, targetUser));
        notificationService.notifyFollow(currentUser, targetUser);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/follow")
    public ResponseEntity<Void> unfollowUser(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Follow follow = followRepository.findByFollowerAndFollowing(currentUser, targetUser)
                .orElseThrow(() -> new RuntimeException("Follow relationship not found"));

        followRepository.delete(follow);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/followers")
    public ResponseEntity<Page<UserSummaryResponse>> getFollowers(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User currentUser = getCurrentUser();

        Pageable pageable = PageRequest.of(page, size);
        Page<UserSummaryResponse> response = followRepository.findByFollowing(targetUser, pageable)
                .map(follow -> {
                    User user = follow.getFollower();
                    boolean followed = followRepository.existsByFollowerAndFollowing(currentUser, user);
                    return UserSummaryResponse.fromEntity(user, followed);
                });
        return ResponseEntity.ok(response);
    }

    @GetMapping("/following")
    public ResponseEntity<Page<UserSummaryResponse>> getFollowing(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User currentUser = getCurrentUser();

        Pageable pageable = PageRequest.of(page, size);
        Page<UserSummaryResponse> response = followRepository.findByFollower(targetUser, pageable)
                .map(follow -> {
                    User user = follow.getFollowing();
                    boolean followed = followRepository.existsByFollowerAndFollowing(currentUser, user);
                    return UserSummaryResponse.fromEntity(user, followed);
                });
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/remove-follower")
    public ResponseEntity<Void> removeFollower(@PathVariable Long userId) {
        User currentUser = getCurrentUser();
        User followerUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Follow follow = followRepository.findByFollowerAndFollowing(followerUser, currentUser)
                .orElseThrow(() -> new RuntimeException("Follow relationship not found"));

        followRepository.delete(follow);
        return ResponseEntity.noContent().build();
    }
}