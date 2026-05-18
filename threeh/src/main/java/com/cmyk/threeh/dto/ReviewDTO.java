package com.cmyk.threeh.dto;


import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.cmyk.threeh.domain.Review;

import lombok.AllArgsConstructor;
import lombok.Builder;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {

    private Long reviewId;

    //코딩 추가_오현옥(상품 아이디, 상품 이름 추가,엔티티 명 카멜표기법에 맞게 수정)
    private Long itemId;
    private String itemName;

    //코딩 추가_오현옥_(로그인 아이디와 회원이름 추가,엔티티 명 카멜표기법에 맞게 수정)
    private Long memberId;
    private String memberLoginId;
    private String memberName;

    //코딩 수정 및 추가_오현옥(Long을 Integer로 변경)
    private Integer reviewScore;
    private String reviewText;

    //코딩 추가_오현옥(로컬데이트타임)
    private LocalDateTime createdAt;

    //코딩 주석처리: 오현옥(이유: db에 해당 컬럼이 없음)
    // private String createdat;

    //빌드 추가 오현옥

    public static ReviewDTO from(Review review){
        return ReviewDTO.builder()
            .reviewId(review.getReviewId())

            .itemId(review.getItem().getItemId())
            .itemName(review.getItem().getItemName())

            .memberId(review.getMember().getMemberId())
            .memberLoginId(review.getMember().getId())
            .memberName(review.getMember().getName())

            .reviewScore(review.getReviewScore())
            .reviewText(review.getReviewText())
            .createdAt(review.getCreatedAt())
            .build();
    }
    
}