package com.cmyk.threeh;

import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

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
	private ItemRepository itemRepository;
    @Autowired
	private BookmarksRepository bookmarksRepository;
	@Autowired
	private BookmarksService bookmarksService;


	@Test
	//@Transactional
	void bookmarksToggle() {

        //더미데이터 입력
        Optional<Member> op_m = memberRepository.findById("user2");
        Optional<Item> op_i = itemRepository.findById(Long.valueOf(1));
        Member member = op_m.get();
        Item item = op_i.get();

        BookmarksDTO dto = new BookmarksDTO();
        dto.setMember(member);
        dto.setItem(item);
        dto.setType("상품");


        //추가
		int toggleFlag = bookmarksService.toggle(dto);
        

        //확인
        if(toggleFlag==-1) {
			System.out.println("북마크 추가/삭제 실패: " + toggleFlag);
			return;
		}


        Optional<Bookmarks> op_b = bookmarksRepository.findByMemberAndItem(member, item);
        Bookmarks bookmark = op_b.get();

		if(toggleFlag==0) {
			System.out.println("북마크 삭제 성공: " + toggleFlag);
            System.out.printf(
                "%d, %s, %s, %s, %s\n",
                bookmark.getBookmakrId(), bookmark.getMember().getId(), bookmark.getItem().getItemId(), bookmark.getCreatedAt(), bookmark.getType()
            );
			return;
		}
		if(toggleFlag==1) {
			System.out.println("북마크 추가 성공: " + toggleFlag);
            System.out.printf(
                "%d, %s, %s, %s, %s\n",
                bookmark.getBookmakrId(), bookmark.getMember().getId(), bookmark.getItem().getItemId(), bookmark.getCreatedAt(), bookmark.getType()
            );
		}

	}



    @Test
	//@Transactional
	void bookmarkGet() {

        //더미데이터 입력
        Optional<Member> op_m = memberRepository.findById("user2");
        Optional<Item> op_i = itemRepository.findById(Long.valueOf(1));
        Member member = op_m.get();
        Item item = op_i.get();


        //북마크 1개 가져오기
		Bookmarks bookmark = bookmarksService.getBookmark(member, item);
	
		System.out.println("북마크 1개 가져오기 성공: ");
		System.out.printf(
			"%d, %s, %s, %s, %s\n",
			bookmark.getBookmakrId(), bookmark.getMember().getId(), bookmark.getItem().getItemId(), bookmark.getCreatedAt(), bookmark.getType()
		);

	}


    @Test
	//@Transactional
	void bookmarkListGet() {

        //더미데이터 입력
        Optional<Member> op_m = memberRepository.findById("user2");
        Member member = op_m.get();


        //북마크 리스트 가져오기
        List<BookmarksDTO> list = bookmarksService.getMyBookmarkList(member);

        System.out.println("북마크 리스트 가져오기 성공: ");
        System.out.println(list);

	}




}
