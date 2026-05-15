package com.cmyk.threeh.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.dto.BookmarksDTO;
import com.cmyk.threeh.service.BookmarksService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    private final BookmarksService bookmarksService;

    // 북마크 추가 / 삭제 토글
    @PostMapping("/toggle")
    public ResponseEntity<?> toggleBookmark(@RequestBody BookmarksDTO dto) {

        int result = bookmarksService.toggle(dto);

        Map<String, Object> response = new HashMap<String, Object>();

        response.put("result", result);
        response.put("bookmarked", result == 1);

        if (result == 1) {
            response.put("message", "북마크에 추가되었습니다.");
        } else {
            response.put("message", "북마크가 삭제되었습니다.");
        }

        return ResponseEntity.ok(response);
    }

    // 내 북마크 목록 조회
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<BookmarksDTO>> getMyBookmarkList(
            @PathVariable Long memberId
    ) {
        List<BookmarksDTO> bookmarks =
                bookmarksService.getMyBookmarksList(memberId);

        return ResponseEntity.ok(bookmarks);
    }

    // 특정 상품 북마크 여부 확인
    @GetMapping("/check")
    public ResponseEntity<?> checkBookmark(
            @RequestParam Long memberId,
            @RequestParam Long itemId
    ) {
        boolean bookmarked =
                bookmarksService.isBookmarked(memberId, itemId);

        Map<String, Object> response = new HashMap<String, Object>();
        response.put("bookmarked", bookmarked);

        return ResponseEntity.ok(response);
    }
}
    //기존 코드======================
    // private final MemberService memberService;
    // private final MemberRepository memberRepository;
    // private final ItemRepository itemRepository;
    // private final ItemService itemService;

    //북마크 토글(추가/삭제)
   //@PreAuthorize("isAuthenticated()")

//     @PostMapping("/toggle")
// 	public BookmarksDTO toggle(@RequestBody BookmarksDTO dto) {

// 		int result = bookmarksService.toggle(dto);

//         if(result == -1) {  //1. 에러 case
//             throw new CustomException(ErrorCode.BOOKMARK_NOT_FOUND);
//         } else if(result == 1) {  //2. 추가 case
//             return dto;
//         } else {  //3. 삭제 case
//             return null;
//         }
		
// 	}

    

//     //북마크 조회
//     //북마크 1개 가져오기
//     @GetMapping("/{bookmakrId}?id={id}&itemId={itemId}")
//     public BookmarksDTO getBookmark(Model model, @PathVariable("bookmakrId") Long bookmakrId, @PathVariable("id") String id, @PathVariable("itemId") Long itemId){

//         Member member = memberService.getUser(id);
//         Long memberId = member.getMemberId();

//         //Bookmarks 엔티티 ---> Bookmarks dto
//         Bookmarks entity = bookmarksService.getBookmark(memberId, itemId);
//         BookmarksDTO dto = new BookmarksDTO();

//         dto.setBookmakrId(entity.getBookmakrId());
//         dto.setMemberId(entity.getMember().getMemberId());
//         dto.setItemId(entity.getItem().getItemId());
//         dto.setCreatedAt(entity.getCreatedAt());
//         dto.setType(entity.getType());

//         return dto;

//     }



//     //북마크 리스트 가져오기
//     @GetMapping("/{id}")
//     public List<BookmarksDTO> getMyBookmarkList(Model model, @PathVariable("id") String id){

//         Member member = memberService.getUser(id);
//         Long memberId = member.getMemberId();

//         List<BookmarksDTO> bookmarkList = bookmarksService.getMyBookmarkList(memberId);

//         return bookmarkList;

//     }


    
// }
