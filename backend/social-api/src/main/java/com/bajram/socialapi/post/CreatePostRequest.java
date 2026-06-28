package com.bajram.socialapi.post;

import jakarta.validation.constraints.Size;

public class CreatePostRequest {

    @Size(max = 2200)
    private String caption;

    private String imageUrl;

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}