package com.cmyk.threeh.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cmyk.threeh.domain.Review;
import com.cmyk.threeh.dto.ReviewSummaryDTO;

public interface ReviewRepository extends JpaRepository<Review,Long> {

    //특정 상품의 리뷰 목록 조회
    //최신 리뷰가 위로 오도록  createdAt 기준 내림차순 정렬
    List<Review> findByItem_ItemIdOrderByCreatedAtDesc(Long itemId);

    //특정 회원이 작성한 리뷰 목록 조회
    //마이페이지에서 사용
    List<Review> findByMember_MemberIdOrderByCreatedAtDesc(Long memberId);

    //특정 회원이 특정 상품에 이미 리뷰를 작성했는지 조회
    boolean existsByMember_MemberIdAndItem_ItemId(Long memberId, Long itemId);

    //상품 평균 별점 조회
    @Query("SELECT COALESCE(AVG(r.reviewScore),0) FROM Review r WHERE r.item.itemId = :itemId")
    Double getAverageScoreByItemId(@Param("itemId") Long itemId);

    // 상품별 리뷰 개수 조회
    @Query("SELECT COUNT(r) FROM Review r WHERE r.item.itemId = :itemId")
    Long getReviewCountByItemId(@Param("itemId") Long itemId);

    //리뷰 평점 조회
    @Query("select new com.cmyk.threeh.dto.ReviewSummaryDTO(" +
       "r.item.itemId, " +
       "coalesce(avg(r.reviewScore), 0), " +
       "count(r)) " +
       "from Review r " +
       "group by r.item.itemId")
    List<ReviewSummaryDTO> getAllReviewSummaries();
}
