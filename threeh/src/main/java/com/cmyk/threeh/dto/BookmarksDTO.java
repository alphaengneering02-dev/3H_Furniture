package com.cmyk.threeh.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookmarksDTO {

    private Long bookmakrId;

    private Long memberId; // Member 엔티티 대신 ID만

    private Long itemId;     // Item 엔티티 대신 ID만

    private LocalDateTime createdAt;

    private String type;
    
}
