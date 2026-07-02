package com.bajram.socialapi.story;

public record HighlightStoryResponse(
        Long itemId,
        Long storyId,
        String mediaUrl,
        String mediaType,
        String caption
) {
    public static HighlightStoryResponse from(HighlightItem item) {
        return new HighlightStoryResponse(
                item.getId(),
                item.getStoryId(),
                item.getMediaUrl(),
                item.getMediaType().name(),
                item.getCaption()
        );
    }
}