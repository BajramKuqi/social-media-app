
package com.bajram.socialapi.story;

public record HighlightStoryResponse(
        Long storyId,
        String mediaUrl,
        String mediaType,
        String caption
) {
    public static HighlightStoryResponse from(Story story) {
        return new HighlightStoryResponse(
                story.getId(),
                story.getMediaUrl(),
                story.getMediaType().name(),
                story.getCaption()
        );
    }
}