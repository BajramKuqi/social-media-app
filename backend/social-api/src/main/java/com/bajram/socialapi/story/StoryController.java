package com.bajram.socialapi.story;

import com.bajram.socialapi.user.User;
import com.bajram.socialapi.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/stories")
public class StoryController {

    private final StoryService storyService;
    private final UserRepository userRepository;

    public StoryController(StoryService storyService, UserRepository userRepository) {
        this.storyService = storyService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @PostMapping
    public ResponseEntity<StoryResponse> createStory(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam("mediaType") Story.MediaType mediaType) {
        User currentUser = getCurrentUser();
        StoryResponse response = storyService.createStory(currentUser, file, caption, mediaType);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/feed")
    public ResponseEntity<List<StoryFeedGroupResponse>> getFeed() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(storyService.getFeed(currentUser));
    }

    @PostMapping("/{storyId}/view")
    public ResponseEntity<StoryResponse> viewStory(@PathVariable Long storyId) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(storyService.viewStory(currentUser, storyId));
    }

    @GetMapping("/{storyId}/viewers")
    public ResponseEntity<List<StoryViewResponse>> getViewers(@PathVariable Long storyId) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(storyService.getViewers(currentUser, storyId));
    }

    @DeleteMapping("/{storyId}")
    public ResponseEntity<Void> deleteStory(@PathVariable Long storyId) {
        User currentUser = getCurrentUser();
        storyService.deleteStory(currentUser, storyId);
        return ResponseEntity.noContent().build();
    }
}
