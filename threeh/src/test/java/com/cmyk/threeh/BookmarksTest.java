package com.cmyk.threeh;

import java.time.LocalDateTime;
import java.util.List;

import javax.transaction.Transactional;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import com.cmyk.threeh.domain.Bookmarks;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.service.BookmarksService;
import com.cmyk.threeh.service.MemberService;
import com.cmyk.threeh.dto.BookmarksDTO;
import com.cmyk.threeh.dto.MemberDTO;

@SpringBootTest
class BookmarksTest {

	@BeforeAll
	static void setup() {
		System.setProperty("oracle.net.tns_admin", "D:/Wallet_swDB");
		System.setProperty("wallet.path", "D:/Wallet_swDB");
	}


	@Autowired
	private MemberService memberService;
	@Autowired
	private BookmarksService bookmarksService;

	@Test
	//@Transactional
	void bookmarksCreate() {

		String id = "user2";
		Long itemId = new Long(2);
		LocalDateTime createdAt = LocalDateTime.now();
		String type = "상품";

		boolean createFlag = bookmarksService.create(id, itemId, type);
		if(!createFlag) {
			System.out.println("북마크 등록 실패: " + createFlag);
			return;
		}

		// Bookmarks bookmarks = bookmarksService.getBookmarkById(id);  //방금 등록한 북마크 가져오기
		List<Bookmarks> bookmarksList = memberService.getUser(id).getBookmarksList();  //회원의 모든 북마크 목록 가져오기

		System.out.println("북마크 등록 성공: " + createFlag);
		System.out.println(bookmarksList);

	}

}
