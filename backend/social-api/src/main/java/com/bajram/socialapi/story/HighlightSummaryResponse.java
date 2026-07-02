package com.bajram.socialapi.story;

public record HighlightSummaryResponse(
        Long id,
        String title,
        String coverImageUrl,
        int storyCount
) {}