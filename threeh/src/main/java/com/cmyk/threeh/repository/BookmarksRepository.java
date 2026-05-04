//데이터 흐름: Repository -> Service -> Controller
package com.cmyk.threeh.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.cmyk.threeh.domain.Bookmarks;


public interface BookmarksRepository extends JpaRepository<Bookmarks, Long> {

    //북마크 1개 가져오기 
    //특정 memberId(사용자)와 ItemId(상품) 조합으로 북마크 객체(Bookmarks)를 찾아 반환
    @Query("SELECT b FROM Bookmarks b WHERE b.member.memberId = :memberId AND b.item.itemId = :itemId")
    Optional<Bookmarks> findByMemberIdAndItemId(@Param("memberId") Long memberId, @Param("itemId") Long itemId);

    //북마크 리스트 가져오기
    @Query("SELECT b FROM Bookmarks b WHERE b.member.memberId = :memberId")
    List<Bookmarks> findByMemberId(@Param("memberId") Long memberId);

    //중복체크
    @Query("SELECT COUNT(b) > 0 FROM Bookmarks b WHERE b.member.memberId = :memberId AND b.item.itemId = :itemId")
    boolean existsByMemberIdAndItemId(@Param("memberId") Long memberId, @Param("memberId")Long itemId);

    
}