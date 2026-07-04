package com.bajram.socialapi.reel;

import com.bajram.socialapi.comment.CommentRepository;
import com.bajram.socialapi.like.LikeRepository;
import com.bajram.socialapi.storage.FileStorageService;
import com.bajram.socialapi.user.User;
import com.bajram.socialapi.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/reels")
public class ReelController {
    private final ReelRepository reelRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    public ReelController(ReelRepository reelRepository, UserRepository userRepository,
                          FileStorageService fileStorageService, LikeRepository likeRepository,
                          CommentRepository commentRepository) {
        this.reelRepository = reelRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ReelResponse> createReel(
            @RequestParam("video") MultipartFile video,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam(value = "durationSeconds", required = false) Integer durationSeconds) {
        if (video.isEmpty()) {
            throw new IllegalArgumentException("A video is required to create a reel");
        }
        User author = getCurrentUser();
        String videoUrl = fileStorageService.uploadFile(video);
        String thumbnailUrl = (thumbnail != null && !thumbnail.isEmpty())
                ? fileStorageService.uploadFile(thumbnail)
                : null;
        Reel reel = new Reel(caption, videoUrl, thumbnailUrl, durationSeconds, author);
        Reel saved = reelRepository.save(reel);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ReelResponse.fromEntity(saved, 0, false, 0));
    }

    @GetMapping
    public ResponseEntity<Page<ReelResponse>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User currentUser = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<Reel> reels = reelRepository.findAllByOrderByCreatedAtDesc(pageable);
        Page<ReelResponse> response = reels.map(reel -> {
            long likeCount = likeRepository.countByReel(reel);
            boolean liked = likeRepository.existsByUserAndReel(currentUser, reel);
            long commentCount = commentRepository.countByReel(reel);
            return ReelResponse.fromEntity(reel, likeCount, liked, commentCount);
        });
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{reelId}")
    public ResponseEntity<Void> deleteReel(@PathVariable Long reelId) {
        User currentUser = getCurrentUser();
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new RuntimeException("Reel not found"));

        if (!reel.getAuthor().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        likeRepository.deleteByReel(reel);
        commentRepository.deleteByReel(reel);
        reelRepository.delete(reel);
        return ResponseEntity.noContent().build();
    }
}