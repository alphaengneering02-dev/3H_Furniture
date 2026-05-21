package com.cmyk.threeh.domain;

import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

//코딩 변경: 엔티티 컬럼명 테이블 명칭과 동일하게 소문자에서 대문자로 변경,유니크제약 추가_오현옥
@Entity
@Table(name = "REVIEW",uniqueConstraints = {
    @UniqueConstraint(
        name="UK_REVIEW_MEMBER_ITEM",
        columnNames = {"MEMBER_ID","ITEM_ID"}
         )
    }
)
@Getter 
@Setter
@NoArgsConstructor
public class Review implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "review_seq")
    @SequenceGenerator(name = "review_seq", sequenceName = "REVIEW_SEQ", allocationSize = 1)
    @Column(name = "REVIEW_ID")
    private Long reviewId;

    //코딩 수정, db 컬럼은 그대로 ITEM_ID지만, java에서는 Loing itemId가 아니라 Item item으로 연결 _오현옥
    //리뷰 대상 상품
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ITEM_ID",nullable = false)
    private Item item;

    //리뷰 작성 회원
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MEMBER_ID", nullable = false)
    private Member member;

    //리뷰별점:1~5
    @Column(name = "REVIEW_SCORE", nullable = false)
    private int reviewScore;

    //리뷰내용 코딩 추가: 낫널,글자 수 제한_오현옥
    @Column(name = "REVIEW_TEXT",nullable = false,length = 255)
    private String reviewText;

    //리뷰 작성일
    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    //코딩 추가_오현옥 리뷰관련 메서드 추가===================
    
    //리뷰 별점 검증
    private void validateReviewScore(Integer reviewScore){
        if(reviewScore==null||reviewScore<1||reviewScore>5){
            throw new IllegalArgumentException("별점은 1점 이상 5점 이하입니다.");
        }
    }

    //리뷰 내용 검증
    private void validateReviewText(String reviewText){
        if(reviewText == null || reviewText.trim().isEmpty()){
            throw new IllegalArgumentException("리뷰 내용을 입력해주세요.");
        }
        if(reviewText.length()>255){
            throw new IllegalArgumentException("리뷰 내용은 255자를 초과할 수 없습니다.");
        }
    }
    
    //리뷰 생성 메서드
    public static Review createReview(Member member , Item item, Integer reviewScore,String reviewText){

        Review review = new Review();

        review.setMember(member);
        review.setItem(item);
        review.setReviewScore(reviewScore);
        review.setReviewText(reviewText);

        review.validateReviewScore(reviewScore);
        review.validateReviewText(reviewText);

        return review;
    }

    //리뷰 수정 메서드
    public void updateReview(Integer reviewScore,String reviewText){
        validateReviewScore(reviewScore);
        validateReviewText(reviewText);

        this.reviewScore = reviewScore;
        this.reviewText = reviewText;
    }
    
    


}