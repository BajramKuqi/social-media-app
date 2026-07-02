
package com.bajram.socialapi.story;

import com.bajram.socialapi.user.User;
import com.bajram.socialapi.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/highlights")
public class HighlightController {

    private final HighlightService highlightService;
    private final UserRepository userRepository;

    public HighlightController(HighlightService highlightService, UserRepository userRepository) {
        this.highlightService = highlightService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    public record CreateHighlightRequest(String title, Long storyId) {}
    public record AddStoryRequest(Long storyId) {}

    @GetMapping
    public ResponseEntity<List<HighlightSummaryResponse>> getHighlights() {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(highlightService.getHighlights(currentUser));
    }

    @PostMapping
    public ResponseEntity<HighlightSummaryResponse> createHighlight(@RequestBody CreateHighlightRequest request) {
        User currentUser = getCurrentUser();
        HighlightSummaryResponse response =
                highlightService.createHighlightWithStory(currentUser, request.title(), request.storyId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{highlightId}/stories")
    public ResponseEntity<HighlightSummaryResponse> addStory(
            @PathVariable Long highlightId,
            @RequestBody AddStoryRequest request) {
        User currentUser = getCurrentUser();
        HighlightSummaryResponse response =
                highlightService.addStoryToHighlight(currentUser, highlightId, request.storyId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{highlightId}")
    public ResponseEntity<HighlightDetailResponse> getHighlightDetail(@PathVariable Long highlightId) {
        return ResponseEntity.ok(highlightService.getHighlightDetail(highlightId));
    }

    @DeleteMapping("/{highlightId}")
    public ResponseEntity<Void> deleteHighlight(@PathVariable Long highlightId) {
        User currentUser = getCurrentUser();
        highlightService.deleteHighlight(currentUser, highlightId);
        return ResponseEntity.noContent().build();
    }
    @DeleteMapping("/{highlightId}/stories/{itemId}")
    public ResponseEntity<Void> deleteHighlightItem(
            @PathVariable Long highlightId,
            @PathVariable Long itemId) {
        User currentUser = getCurrentUser();
        highlightService.deleteHighlightItem(currentUser, highlightId, itemId);
        return ResponseEntity.noContent().build();
    }
}