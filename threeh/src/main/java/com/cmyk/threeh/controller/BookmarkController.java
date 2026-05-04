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
import com.cmyk.threeh.repository.ItemRepository;
import com.cmyk.threeh.service.BookmarksService;
import com.cmyk.threeh.service.ItemService;
import com.cmyk.threeh.service.MemberService;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/bookmark")
@RequiredArgsConstructor
public class BookmarkController {

    private final MemberService memberService;
    private final ItemRepository itemRepository;
    private final ItemService itemService;
    private final BookmarksService bookmarksService;



    //북마크 토글(추가/삭제)
    @PreAuthorize("isAuthenticated")
    @PostMapping("/toggle")
	public ResponseEntity<?> toggle(@RequestBody BookmarksDTO dto) {

		try {
			int result = bookmarksService.toggle(dto);

            if(result == -1) {  //1. 에러 case
                Map<String, String> errorMap = new HashMap<>();
                errorMap.put("BOOKMARK_FAILED", "북마크에 실패하였습니다.");
                return ResponseEntity.badRequest().body(errorMap);
            } else if(result == 1) {  //2. 추가 case
                return ResponseEntity.ok().body("북마크 추가가 완료되었습니다."); // 성공 응답
            } else {  //3. 삭제 case
                return ResponseEntity.ok().body("북마크 삭제가 완료되었습니다."); // 성공 응답
            }
		} catch (DataIntegrityViolationException e) {  //데이터 무결성 제약조건 위반
			Map<String, String> errorMap = new HashMap<>();
            errorMap.put("BOOKMARK_FOUND", "이미 존재하는 북마크입니다.");
            return ResponseEntity.badRequest().body(errorMap);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body("서버 오류가 발생했습니다(북마크 실패).");
		}
		
	}

    

    //북마크 조회
    //북마크 1개 가져오기
    @GetMapping("/info/{bookmakrId}?id={id}&itemId={itemId}")
    public ResponseEntity<?> getBookmark(Model model, @PathVariable("bookmakrId") Long bookmakrId, @PathVariable("id") String id, @PathVariable("itemId") Long itemId){

        try {
            Member member = memberService.getUser(id);
            Optional<Item> op_i  = itemRepository.findById(itemId);
            Item item = op_i.get();
            

			Bookmarks bookmark = bookmarksService.getBookmark(member, item);

            model.addAttribute("bookmark", bookmark);
            return ResponseEntity.ok().body("해당 북마크가 조회되었습니다"); // 성공 응답
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body("서버 오류가 발생했습니다(북마크 조회 실패).");
		}

    }



    //북마크 리스트 가져오기
    @GetMapping("/info/{id}")
    public ResponseEntity<?> getMyBookmarkList(Model model, @PathVariable("id") String id){

        try {
            Member member = memberService.getUser(id);

			List<BookmarksDTO> bookmarkList = bookmarksService.getMyBookmarkList(member);

            model.addAttribute("bookmarkList", bookmarkList);
            return ResponseEntity.ok().body("회원의 북마크 리스트가 조회되었습니다"); // 성공 응답
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body("서버 오류가 발생했습니다(회원의 북마크 리스트 조회 실패).");
		}

    }


    
}
