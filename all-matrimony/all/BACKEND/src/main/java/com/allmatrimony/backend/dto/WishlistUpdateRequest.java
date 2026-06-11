package com.allmatrimony.backend.dto;

import java.util.List;

public class WishlistUpdateRequest {

    private List<String> profileIds;

    public List<String> getProfileIds() {
        return profileIds;
    }

    public void setProfileIds(List<String> profileIds) {
        this.profileIds = profileIds;
    }
}
