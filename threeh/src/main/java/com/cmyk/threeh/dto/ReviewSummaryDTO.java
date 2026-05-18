package com.cmyk.threeh.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSummaryDTO {

    // 상품 ID
    private Long itemId;

    // 평균 별점
    // 예: 4.5
    private Double averageScore;

    // 리뷰 개수
    // 예: 12
    private Long reviewCount;
}