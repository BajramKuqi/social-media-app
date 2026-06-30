package com.bajram.socialapi.post;

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
@RequestMapping("/posts")
public class PostController {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    public PostController(PostRepository postRepository, UserRepository userRepository,
                          FileStorageService fileStorageService, LikeRepository likeRepository,
                          CommentRepository commentRepository) {
        this.postRepository = postRepository;
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
    public ResponseEntity<PostResponse> createPost(
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "caption", required = false) String caption) {
        if (image.isEmpty()) {
            throw new IllegalArgumentException("An image is required to create a post");
        }
        User author = getCurrentUser();
        String imageUrl = fileStorageService.uploadFile(image);
        Post post = new Post(caption, imageUrl, author);
        Post saved = postRepository.save(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(PostResponse.fromEntity(saved, 0, false, 0));
    }

    @GetMapping
    public ResponseEntity<Page<PostResponse>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User currentUser = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findAllByOrderByCreatedAtDesc(pageable);
        Page<PostResponse> response = posts.map(post -> {
            long likeCount = likeRepository.countByPost(post);
            boolean liked = likeRepository.existsByUserAndPost(currentUser, post);
            long commentCount = commentRepository.countByPost(post);
            return PostResponse.fromEntity(post, likeCount, liked, commentCount);
        });
        return ResponseEntity.ok(response);
    }
}