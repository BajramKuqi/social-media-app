
package com.bajram.socialapi.story;

import com.bajram.socialapi.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HighlightService {

    private final HighlightRepository highlightRepository;
    private final HighlightItemRepository highlightItemRepository;
    private final StoryRepository storyRepository;

    public HighlightService(HighlightRepository highlightRepository,
                            HighlightItemRepository highlightItemRepository,
                            StoryRepository storyRepository) {
        this.highlightRepository = highlightRepository;
        this.highlightItemRepository = highlightItemRepository;
        this.storyRepository = storyRepository;
    }

    public List<HighlightSummaryResponse> getHighlights(User owner) {
        return highlightRepository.findByOwnerIdOrderByCreatedAtAsc(owner.getId()).stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    public HighlightSummaryResponse createHighlightWithStory(User owner, String title, Long storyId) {
        String trimmedTitle = title == null ? "" : title.trim();
        if (trimmedTitle.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Highlight title is required");
        }

        Story story = getOwnedStoryOrThrow(owner, storyId);

        Highlight highlight = new Highlight();
        highlight.setOwner(owner);
        highlight.setTitle(trimmedTitle);
        Highlight saved = highlightRepository.save(highlight);

        addStoryInternal(saved, story);

        return toSummary(saved);
    }

    public HighlightSummaryResponse addStoryToHighlight(User owner, Long highlightId, Long storyId) {
        Highlight highlight = highlightRepository.findByIdAndOwnerId(highlightId, owner.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Highlight not found"));

        Story story = getOwnedStoryOrThrow(owner, storyId);

        addStoryInternal(highlight, story);

        return toSummary(highlight);
    }

    public HighlightDetailResponse getHighlightDetail(User owner, Long highlightId) {
        Highlight highlight = highlightRepository.findByIdAndOwnerId(highlightId, owner.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Highlight not found"));

        List<HighlightStoryResponse> stories = highlightItemRepository.findByHighlightIdOrderByAddedAtAsc(highlightId)
                .stream()
                .map(item -> HighlightStoryResponse.from(item.getStory()))
                .collect(Collectors.toList());

        return new HighlightDetailResponse(highlight.getId(), highlight.getTitle(), stories);
    }

    public void deleteHighlight(User owner, Long highlightId) {
        Highlight highlight = highlightRepository.findByIdAndOwnerId(highlightId, owner.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Highlight not found"));

        highlightItemRepository.deleteByHighlightId(highlight.getId());
        highlightRepository.delete(highlight);
    }

    private void addStoryInternal(Highlight highlight, Story story) {
        boolean alreadyAdded = highlightItemRepository.existsByHighlightIdAndStoryId(highlight.getId(), story.getId());
        if (alreadyAdded) {
            return;
        }
        HighlightItem item = new HighlightItem();
        item.setHighlight(highlight);
        item.setStory(story);
        highlightItemRepository.save(item);
    }

    private Story getOwnedStoryOrThrow(User owner, Long storyId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Story not found"));

        if (!story.getAuthor().getId().equals(owner.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only highlight your own stories");
        }

        return story;
    }

    private HighlightSummaryResponse toSummary(Highlight highlight) {
        List<HighlightItem> items = highlightItemRepository.findByHighlightIdOrderByAddedAtAsc(highlight.getId());
        String coverImageUrl = items.isEmpty() ? null : items.get(0).getStory().getMediaUrl();
        return new HighlightSummaryResponse(highlight.getId(), highlight.getTitle(), coverImageUrl, items.size());
    }
}