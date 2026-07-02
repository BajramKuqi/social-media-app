package com.bajram.socialapi.story;

import com.bajram.socialapi.follow.FollowRepository;
import com.bajram.socialapi.storage.FileStorageService;
import com.bajram.socialapi.user.User;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StoryService {

    private final StoryRepository storyRepository;
    private final StoryViewRepository storyViewRepository;
    private final HighlightItemRepository highlightItemRepository;
    private final FollowRepository followRepository;
    private final FileStorageService fileStorageService;

    public StoryService(StoryRepository storyRepository,
                        StoryViewRepository storyViewRepository,
                        HighlightItemRepository highlightItemRepository,
                        FollowRepository followRepository,
                        FileStorageService fileStorageService) {
        this.storyRepository = storyRepository;
        this.storyViewRepository = storyViewRepository;
        this.highlightItemRepository = highlightItemRepository;
        this.followRepository = followRepository;
        this.fileStorageService = fileStorageService;
    }

    public StoryResponse createStory(User author, MultipartFile file, String caption, Story.MediaType mediaType) {
        String mediaUrl = fileStorageService.uploadFile(file);

        Story story = new Story();
        story.setAuthor(author);
        story.setMediaUrl(mediaUrl);
        story.setMediaType(mediaType);
        story.setCaption(caption);

        Story saved = storyRepository.save(story);
        return StoryResponse.from(saved, false);
    }

    public List<StoryFeedGroupResponse> getFeed(User currentUser) {
        List<Long> authorIds = new ArrayList<>(followRepository.findFollowingIdsByFollower(currentUser));
        authorIds.add(currentUser.getId());

        Instant now = Instant.now();
        List<Story> activeStories = storyRepository.findActiveByAuthorIdIn(authorIds, now);

        Map<Long, List<Story>> grouped = activeStories.stream()
                .collect(Collectors.groupingBy(s -> s.getAuthor().getId(), LinkedHashMap::new, Collectors.toList()));

        List<StoryFeedGroupResponse> result = new ArrayList<>();
        for (Map.Entry<Long, List<Story>> entry : grouped.entrySet()) {
            List<Story> stories = entry.getValue();
            User author = stories.get(0).getAuthor();

            boolean hasUnseen = false;
            List<StoryResponse> storyResponses = new ArrayList<>();
            for (Story story : stories) {
                boolean viewed = storyViewRepository.existsByStoryIdAndViewerId(story.getId(), currentUser.getId());
                if (!viewed) {
                    hasUnseen = true;
                }
                storyResponses.add(StoryResponse.from(story, viewed));
            }

            result.add(new StoryFeedGroupResponse(
                    author.getId(), author.getUsername(), author.getAvatarUrl(),
                    hasUnseen, storyResponses
            ));
        }

        return result;
    }

    public StoryResponse viewStory(User viewer, Long storyId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Story not found"));

        if (story.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.GONE, "Story has expired");
        }

        boolean alreadyViewed = storyViewRepository.existsByStoryIdAndViewerId(storyId, viewer.getId());
        if (!alreadyViewed) {
            StoryView view = new StoryView();
            view.setStory(story);
            view.setViewer(viewer);
            storyViewRepository.save(view);
        }

        return StoryResponse.from(story, true);
    }

    public List<StoryViewResponse> getViewers(User requester, Long storyId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Story not found"));

        if (!story.getAuthor().getId().equals(requester.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the author can view this list");
        }

        return storyViewRepository.findByStoryIdOrderByViewedAtDesc(storyId).stream()
                .map(StoryViewResponse::from)
                .collect(Collectors.toList());
    }

    public void deleteStory(User requester, Long storyId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Story not found"));

        if (!story.getAuthor().getId().equals(requester.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own stories");
        }

        storyViewRepository.deleteByStoryId(storyId);
        highlightItemRepository.deleteByStoryId(storyId);
        storyRepository.delete(story);
    }
}
