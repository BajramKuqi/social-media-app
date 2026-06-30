package com.bajram.socialapi.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateCommentRequest {

    @NotBlank(message = "Comment content is required")
    @Size(max = 1000, message = "Comment must be under 1000 characters")
    private String content;

    public CreateCommentRequest() {
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}