package com.cmyk.threeh.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.cmyk.threeh.domain.Bookmarks;
import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.dto.BookmarksDTO;
import com.cmyk.threeh.dto.MemberDTO;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.ItemRepository;
import com.cmyk.threeh.repository.MemberRepository;
import com.cmyk.threeh.service.BookmarksService;
import com.cmyk.threeh.service.ItemService;
import com.cmyk.threeh.service.MemberService;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/bookmark")
@RequiredArgsConstructor
public class BookmarkController {

    private final MemberService memberService;
    private final MemberRepository memberRepository;
    private final ItemRepository itemRepository;
    private final ItemService itemService;
    private final BookmarksService bookmarksService;



    //북마크 토글(추가/삭제)
    @PreAuthorize("isAuthenticated")
    @PostMapping("/toggle")
	public BookmarksDTO toggle(@RequestBody BookmarksDTO dto) {

		int result = bookmarksService.toggle(dto);

        if(result == -1) {  //1. 에러 case
            throw new CustomException(ErrorCode.BOOKMARK_NOT_FOUND);
        } else if(result == 1) {  //2. 추가 case
            return dto;
        } else {  //3. 삭제 case
            return null;
        }
		
	}

    

    //북마크 조회
    //북마크 1개 가져오기
    @GetMapping("/{bookmakrId}?id={id}&itemId={itemId}")
    public BookmarksDTO getBookmark(Model model, @PathVariable("bookmakrId") Long bookmakrId, @PathVariable("id") String id, @PathVariable("itemId") Long itemId){

        Member member = memberService.getUser(id);
        Long memberId = member.getMemberId();

        //Bookmarks 엔티티 ---> Bookmarks dto
        Bookmarks entity = bookmarksService.getBookmark(memberId, itemId);
        BookmarksDTO dto = new BookmarksDTO();

        dto.setBookmakrId(entity.getBookmakrId());
        dto.setMemberId(entity.getMember().getMemberId());
        dto.setItemId(entity.getItem().getItemId());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setType(entity.getType());

        return dto;

    }



    //북마크 리스트 가져오기
    @GetMapping("/{id}")
    public List<BookmarksDTO> getMyBookmarkList(Model model, @PathVariable("id") String id){

        Member member = memberService.getUser(id);
        Long memberId = member.getMemberId();

        List<BookmarksDTO> bookmarkList = bookmarksService.getMyBookmarkList(memberId);

        return bookmarkList;

    }


    
}
