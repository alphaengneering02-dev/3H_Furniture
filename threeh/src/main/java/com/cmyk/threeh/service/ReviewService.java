package com.cmyk.threeh.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.Review;
import com.cmyk.threeh.dto.ReviewDTO;
import com.cmyk.threeh.dto.ReviewSummaryDTO;
import com.cmyk.threeh.enums.OrderState;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.ItemRepository;
import com.cmyk.threeh.repository.OrderItemRepository;
import com.cmyk.threeh.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ItemRepository itemRepository;
    private final OrderItemRepository orderItemRepository;
    private final MemberService memberService;

    //저장,수정,삭제 메서드만 트랜젝셔널 적용.
    @Transactional
    public ReviewDTO createReview(
            String loginId,
            Long itemId,
            Integer reviewScore,
            String reviewText
    ) {
        Member member = memberService.getUser(loginId);

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new CustomException(ErrorCode.ITEM_NOT_FOUND));

        if (reviewScore == null || reviewScore < 1 || reviewScore > 5) {
            throw new IllegalArgumentException("별점은 1점 이상 5점 이하입니다.");
        }

        if (reviewText == null || reviewText.trim().isEmpty()) {
            throw new IllegalArgumentException("리뷰 내용을 입력해주세요.");
        }

        if (reviewText.length() > 255) {
            throw new IllegalArgumentException("리뷰 내용은 255자를 초과할 수 없습니다.");
        }

        // 실제 구매 여부 확인(구매여부랑, 중복 여부 확인_오더아이템레포지토리에서 가져오기.)
        boolean purchased = orderItemRepository.existsPurchasedItemByState(
                member.getMemberId(),
                itemId,
                OrderState.PURCHASED
        );

        if (!purchased) {
            throw new IllegalArgumentException("구매한 상품만 리뷰를 작성할 수 있습니다.");
        }

        // 중복 리뷰 방지(이미 리뷰가 작성된 상품에 또 리뷰를 작성하는것을 방지 )
        boolean alreadyReviewed =
                reviewRepository.existsByMember_MemberIdAndItem_ItemId(
                        member.getMemberId(),
                        itemId
                );

        if (alreadyReviewed) {
            throw new IllegalArgumentException("이미 이 상품에 리뷰를 작성했습니다.");
        }

        Review review = Review.createReview(
                member,
                item,
                reviewScore,
                reviewText
        );

        Review savedReview = reviewRepository.save(review);

        return ReviewDTO.from(savedReview);
    }

    // 특정 상품 리뷰 목록 조회
    public List<ReviewDTO> getItemReviews(Long itemId) {
        return reviewRepository.findByItem_ItemIdOrderByCreatedAtDesc(itemId)
                .stream()
                .map(ReviewDTO::from)
                .collect(Collectors.toList());
    }

    // 내가 작성한 리뷰 목록 조회
    public List<ReviewDTO> getMyReviews(String loginId) {
        Member member = memberService.getUser(loginId);

        return reviewRepository.findByMember_MemberIdOrderByCreatedAtDesc(
                        member.getMemberId()
                )
                .stream()
                .map(ReviewDTO::from)
                .collect(Collectors.toList());
    }

    //리뷰 평점 정렬하기
    public Map<Long,ReviewSummaryDTO> getAllReviewSummaries(){
        return reviewRepository.getAllReviewSummaries()
            .stream()
            .collect(Collectors.toMap(ReviewSummaryDTO::getItemId, summary->summary));
    }
    

    // 상품 리뷰 평균 평점 / 리뷰 개수 조회
    public ReviewSummaryDTO getReviewSummary(Long itemId) {
        Double averageScore = reviewRepository.getAverageScoreByItemId(itemId);
        Long reviewCount = reviewRepository.getReviewCountByItemId(itemId);

        return ReviewSummaryDTO.builder()
                .itemId(itemId)
                .averageScore(averageScore)
                .reviewCount(reviewCount)
                .build();
    }

    // 리뷰 수정
    @Transactional
    public ReviewDTO updateReview(
            String loginId,
            Long reviewId,
            Integer reviewScore,
            String reviewText
    ) {
        Member member = memberService.getUser(loginId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));

        if (!review.getMember().getMemberId().equals(member.getMemberId())) {
            throw new IllegalArgumentException("본인이 작성한 리뷰만 수정할 수 있습니다.");
        }

        review.updateReview(reviewScore, reviewText);

        return ReviewDTO.from(review);
    }

    // 리뷰 삭제
    @Transactional
    public void deleteReview(String loginId, Long reviewId) {
        Member member = memberService.getUser(loginId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));

        if (!review.getMember().getMemberId().equals(member.getMemberId())) {
            throw new IllegalArgumentException("본인이 작성한 리뷰만 삭제할 수 있습니다.");
        }

        reviewRepository.delete(review);
    }

    //관리자 삭제 메서드(관리자는 멤버를 찾을 필요가 없음 즉, 관리자가 리뷰를 쓸 일 없으니까.)
    @Transactional
    public void adminDeleteReview(Long reviewId){
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(()-> new CustomException(ErrorCode.REVIEW_NOT_FOUND));
            reviewRepository.delete(review);
    }
}