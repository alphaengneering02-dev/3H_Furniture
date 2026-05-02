//데이터 흐름: Repository -> Service -> Controller
package com.cmyk.threeh.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cmyk.threeh.domain.Bookmarks;
import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.Member;


public interface BookmarksRepository extends JpaRepository<Bookmarks, Long> {

    //북마크 1개 가져오기 
    //특정 Member(사용자)와 ItemId(상품) 조합으로 북마크 객체(Bookmarks)를 찾아 반환
    Optional<Bookmarks> findByMemberAndItem(Member Member, Item item);

    //북마크 리스트 가져오기
    List<Bookmarks> findByMember(Member Member);

    //중복체크
    boolean existsByMemberAndItem(Member Member, Item item);

    
}