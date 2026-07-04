package com.bajram.socialapi.user;

import com.bajram.socialapi.follow.FollowRepository;
import com.bajram.socialapi.post.Post;
import com.bajram.socialapi.post.PostRepository;
import com.bajram.socialapi.post.PostResponse;
import com.bajram.socialapi.like.LikeRepository;
import com.bajram.socialapi.comment.CommentRepository;
import com.bajram.socialapi.reel.Reel;
import com.bajram.socialapi.reel.ReelRepository;
import com.bajram.socialapi.reel.ReelResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.bajram.socialapi.storage.FileStorageService;
import org.springframework.web.multipart.MultipartFile;
import com.bajram.socialapi.follow.UserSummaryResponse;
import java.util.List;
import java.util.stream.Collectors;
import com.bajram.socialapi.story.HighlightService;
import com.bajram.socialapi.story.HighlightSummaryResponse;

@RestController
@RequestMapping("/users")
public class UserProfileController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ReelRepository reelRepository;
    private final FollowRepository followRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final HighlightService highlightService;

    private final FileStorageService fileStorageService;

    public UserProfileController(UserRepository userRepository, PostRepository postRepository,
                                 ReelRepository reelRepository, FollowRepository followRepository,
                                 LikeRepository likeRepository, CommentRepository commentRepository,
                                 HighlightService highlightService, FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.reelRepository = reelRepository;
        this.followRepository = followRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.highlightService = highlightService;
        this.fileStorageService = fileStorageService;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @GetMapping("/{username}/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable String username) {
        User targetUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User currentUser = getCurrentUser();

        long postCount = postRepository.findByAuthor(targetUser, Pageable.unpaged()).getTotalElements();
        long reelCount = reelRepository.findByAuthor(targetUser, Pageable.unpaged()).getTotalElements();
        long followerCount = followRepository.countByFollowing(targetUser);
        long followingCount = followRepository.countByFollower(targetUser);
        boolean followed = followRepository.existsByFollowerAndFollowing(currentUser, targetUser);

        UserProfileResponse response = new UserProfileResponse(
                targetUser.getId(), targetUser.getUsername(), targetUser.getAvatarUrl(),
                postCount, reelCount, followerCount, followingCount, followed
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{username}/highlights")
    public ResponseEntity<List<HighlightSummaryResponse>> getUserHighlights(@PathVariable String username) {
        User targetUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(highlightService.getHighlights(targetUser));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserSummaryResponse>> searchUsers(@RequestParam String query) {
        List<UserSummaryResponse> results = userRepository
                .findTop10ByUsernameContainingIgnoreCase(query).stream()
                .map(UserSummaryResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{username}/posts")
    public ResponseEntity<Page<PostResponse>> getUserPosts(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User targetUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User currentUser = getCurrentUser();

        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findByAuthor(targetUser, pageable);
        Page<PostResponse> response = posts.map(post -> {
            long likeCount = likeRepository.countByPost(post);
            boolean liked = likeRepository.existsByUserAndPost(currentUser, post);
            long commentCount = commentRepository.countByPost(post);
            return PostResponse.fromEntity(post, likeCount, liked, commentCount);
        });
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{username}/reels")
    public ResponseEntity<Page<ReelResponse>> getUserReels(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User targetUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User currentUser = getCurrentUser();

        Pageable pageable = PageRequest.of(page, size);
        Page<Reel> reels = reelRepository.findByAuthor(targetUser, pageable);
        Page<ReelResponse> response = reels.map(reel -> {
            long likeCount = likeRepository.countByReel(reel);
            boolean liked = likeRepository.existsByUserAndReel(currentUser, reel);
            long commentCount = commentRepository.countByReel(reel);
            return ReelResponse.fromEntity(reel, likeCount, liked, commentCount);
        });
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/avatar")
    public ResponseEntity<UserProfileResponse> updateAvatar(@RequestParam("image") MultipartFile image) {
        User currentUser = getCurrentUser();
        String avatarUrl = fileStorageService.uploadFile(image);
        currentUser.setAvatarUrl(avatarUrl);
        userRepository.save(currentUser);

        long postCount = postRepository.findByAuthor(currentUser, Pageable.unpaged()).getTotalElements();
        long reelCount = reelRepository.findByAuthor(currentUser, Pageable.unpaged()).getTotalElements();
        long followerCount = followRepository.countByFollowing(currentUser);
        long followingCount = followRepository.countByFollower(currentUser);

        UserProfileResponse response = new UserProfileResponse(
                currentUser.getId(), currentUser.getUsername(), currentUser.getAvatarUrl(),
                postCount, reelCount, followerCount, followingCount, false
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/me/avatar")
    public ResponseEntity<UserProfileResponse> removeAvatar() {
        User currentUser = getCurrentUser();
        currentUser.setAvatarUrl(null);
        userRepository.save(currentUser);

        long postCount = postRepository.findByAuthor(currentUser, Pageable.unpaged()).getTotalElements();
        long reelCount = reelRepository.findByAuthor(currentUser, Pageable.unpaged()).getTotalElements();
        long followerCount = followRepository.countByFollowing(currentUser);
        long followingCount = followRepository.countByFollower(currentUser);

        UserProfileResponse response = new UserProfileResponse(
                currentUser.getId(), currentUser.getUsername(), currentUser.getAvatarUrl(),
                postCount, reelCount, followerCount, followingCount, false
        );
        return ResponseEntity.ok(response);
    }
}