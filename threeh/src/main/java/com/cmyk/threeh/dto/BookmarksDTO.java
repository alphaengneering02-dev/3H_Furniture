package com.cmyk.threeh.dto;

import java.time.LocalDateTime;

import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.Member;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class BookmarksDTO {

    private Long bookmakrId;

    private Long memberId;

    private Long itemId;

    private LocalDateTime createdAt;

    private String type;
    
}
