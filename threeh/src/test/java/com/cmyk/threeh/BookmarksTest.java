package com.cmyk.threeh;

import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.cmyk.threeh.domain.Bookmarks;
import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.dto.BookmarksDTO;
import com.cmyk.threeh.repository.BookmarksRepository;
import com.cmyk.threeh.repository.ItemRepository;
import com.cmyk.threeh.repository.MemberRepository;
import com.cmyk.threeh.service.BookmarksService;
import com.cmyk.threeh.service.MemberService;

@SpringBootTest
class BookmarksTest {

	@BeforeAll
	static void setup() {
		System.setProperty("oracle.net.tns_admin", "D:/Wallet_swDB");
		System.setProperty("wallet.path", "D:/Wallet_swDB");
	}


	@Autowired
	private MemberRepository memberRepository;
	@Autowired
	private MemberService memberService;
	@Autowired
	private BookmarksService bookmarksService;


	// @Test
	// //@Transactional
	// void bookmarksToggle() {

    //     //북마크할 회원, 아이템 입력
    //     Member member = memberService.getUser("user2");
    //     Long memberId = member.getMemberId();
    //     Long itemId = Long.valueOf(3);

    //     BookmarksDTO dto = new BookmarksDTO();
    //     dto.setMemberId(memberId);
    //     dto.setItemId(itemId);
    //     dto.setType("상품");


    //     //북마크 추가
	// 	int toggleFlag = bookmarksService.toggle(dto);
        

    //     //확인
    //     if(toggleFlag==-1) {
	// 		System.out.println("북마크 추가/삭제 실패: " + toggleFlag);
	// 		return;
	// 	}


	// 	if(toggleFlag==0) {
	// 		System.out.println("북마크 삭제 성공: " + toggleFlag);
	// 		return;
	// 	}
	// 	if(toggleFlag==1) {
    //         Bookmarks bookmark = bookmarksService.getBookmark(memberId, itemId);
	// 		System.out.println("북마크 추가 성공: " + toggleFlag);
    //         System.out.printf(
    //             "%d, %s, %s, %s, %s\n",
    //             bookmark.getBookmakrId(), bookmark.getMember().getId(), bookmark.getItem().getItemId(), bookmark.getCreatedAt(), bookmark.getType()
    //         );
	// 	}

	// }



    @Test
	@Transactional
	void bookmarkGet() {

        //북마크한 회원, 아이템 입력
        Member member = memberService.getUser("user2");
        Long memberId = member.getMemberId();
        Long itemId = Long.valueOf(1);
        


        //북마크 1개 가져오기
		Bookmarks bookmark = bookmarksService.getBookmark(memberId, itemId);
	
		System.out.println("북마크 1개 가져오기 성공: ");
		System.out.printf(
			"%d, %s, %s, %s, %s\n",
			bookmark.getBookmakrId(), bookmark.getMember().getId(), bookmark.getItem().getItemId(), bookmark.getCreatedAt(), bookmark.getType()
		);

	}


    @Test
	@Transactional
	void bookmarkListGet() {

        //북마크한 회원 입력
        Optional<Member> op_m = memberRepository.findById("user2");
        Member member = op_m.get();
        Long memberId = member.getMemberId();


        //북마크 리스트 가져오기
        List<BookmarksDTO> list = bookmarksService.getMyBookmarkList(memberId);

        System.out.println("북마크 리스트 가져오기 성공: ");
        for (BookmarksDTO bookmark : list) {
            System.out.printf(
                "%d, %s, %s, %s, %s\n",
                bookmark.getBookmakrId(), bookmark.getMemberId(), bookmark.getItemId(), bookmark.getCreatedAt(), bookmark.getType()
            );
        }

	}




}
