package com.cmyk.threeh.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.dto.ReviewDTO;
import com.cmyk.threeh.dto.ReviewSummaryDTO;
import com.cmyk.threeh.service.ReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    // 리뷰 작성
    // 구매한 유저만 작성 가능 여부는 ReviewService에서 검사
    @PostMapping("/{itemId}")
    public ResponseEntity<?> createReview(
            @PathVariable Long itemId,
            @RequestBody Map<String, Object> payload,
            Principal principal
    ) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        try {
            Integer reviewScore = Integer.parseInt(
                    payload.get("reviewScore").toString()
            );

            String reviewText = payload.get("reviewText").toString();

            ReviewDTO review = reviewService.createReview(
                    principal.getName(),
                    itemId,
                    reviewScore,
                    reviewText
            );

            return ResponseEntity.ok(review);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 특정 상품의 리뷰 목록 조회
    // ItemDetail.js에서 사용
    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<ReviewDTO>> getItemReviews(
            @PathVariable Long itemId
    ) {
        List<ReviewDTO> reviews = reviewService.getItemReviews(itemId);

        return ResponseEntity.ok(reviews);
    }

    // 특정 상품의 평균 별점 / 리뷰 개수 조회
    // Item.js, ItemDetail.js에서 사용
    @GetMapping("/summary/{itemId}")
    public ResponseEntity<ReviewSummaryDTO> getReviewSummary(
            @PathVariable Long itemId
    ) {
        ReviewSummaryDTO summary = reviewService.getReviewSummary(itemId);

        return ResponseEntity.ok(summary);
    }

    // 내가 작성한 리뷰 목록 조회
    // Mypage.js에서 사용
    @GetMapping("/my")
    public ResponseEntity<?> getMyReviews(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        List<ReviewDTO> reviews = reviewService.getMyReviews(
                principal.getName()
        );

        return ResponseEntity.ok(reviews);
    }

    // 내가 작성한 리뷰 수정
    // Mypage.js에서 사용
    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(
            @PathVariable Long reviewId,
            @RequestBody Map<String, Object> payload,
            Principal principal
    ) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        try {
            Integer reviewScore = Integer.parseInt(
                    payload.get("reviewScore").toString()
            );

            String reviewText = payload.get("reviewText").toString();

            ReviewDTO review = reviewService.updateReview(
                    principal.getName(),
                    reviewId,
                    reviewScore,
                    reviewText
            );

            return ResponseEntity.ok(review);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 내가 작성한 리뷰 삭제
    // Mypage.js에서 사용
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @PathVariable Long reviewId,
            Principal principal
    ) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        try {
            reviewService.deleteReview(principal.getName(), reviewId);

            return ResponseEntity.ok("리뷰가 삭제되었습니다.");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}