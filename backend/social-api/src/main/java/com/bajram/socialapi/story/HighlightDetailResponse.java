
package com.bajram.socialapi.story;

import java.util.List;

public record HighlightDetailResponse(
        Long id,
        String title,
        List<HighlightStoryResponse> stories
) {}