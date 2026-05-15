package com.cmyk.threeh.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cmyk.threeh.domain.Bookmarks;
import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.dto.BookmarksDTO;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.AdminsRepository;
import com.cmyk.threeh.repository.BookmarksRepository;
import com.cmyk.threeh.repository.ItemRepository;
import com.cmyk.threeh.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookmarksService {
    
    private final BookmarksRepository bookmarksRepository;
    private final ItemRepository itemRepository;
    private final MemberRepository memberRepository;

	

	//북마크 토글
    //이미 북마크가 있으면 삭제하고 0반환
    //북마크가 없으면 추가하고 1반환
    @Transactional
    public int toggle(BookmarksDTO dto) {

         //북마크 정보
        Long memberId = dto.getMemberId();
        Long itemId = dto.getItemId();
        String type = dto.getType();
        
        //수정 및 추가_오현옥
        if(memberId ==null){
            throw new CustomException(ErrorCode.MEMBER_NOT_FOUND);
        }

        if(itemId ==null){
            throw new CustomException(ErrorCode.ITEM_NOT_FOUND);
        }

        Member member = memberRepository.findByMemberId(memberId)
                    .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));
        
        Item item = itemRepository.findById(itemId)
                    .orElseThrow(()->new CustomException(ErrorCode.ITEMIMG_NOT_FOUND));

        Optional<Bookmarks> existingBookmark = bookmarksRepository.findByMemberIdAndItemId(memberId, itemId);
        
        //북마크가 없으면 추가

        if(!existingBookmark.isPresent()){
            Bookmarks bookmarks = new Bookmarks();

            bookmarks.setMember(member);
            bookmarks.setItem(item);
            bookmarks.setCreatedAt(LocalDateTime.now());
            bookmarks.setType(type !=null ? type: "ITEM");

            bookmarksRepository.save(bookmarks);

            return 1;
        }

        //북마크가 있으면 삭제
        bookmarksRepository.delete(existingBookmark.get());
        return 0;
    }

    //북마크 1개 조회
    public Bookmarks getBookmarks(Long memberId, Long itemId){
        return bookmarksRepository.findByMemberIdAndItemId(memberId, itemId)
            .orElseThrow(()-> new CustomException(ErrorCode.BOOKMARK_NOT_FOUND));
    }

    //내 북마크 리스트 조회
    public List<BookmarksDTO> getMyBookmarksList(Long memberId){
        if(memberId == null){
            throw new CustomException(ErrorCode.MEMBER_NOT_FOUND);
        }
        return bookmarksRepository.findByMemberId(memberId)
                .stream()
                .map(bookmark -> BookmarksDTO.builder()
                    .bookmakrId(bookmark.getBookmakrId())
                    .memberId(bookmark.getMember().getMemberId())
                    .itemId(bookmark.getItem().getItemId())
                    .createdAt(bookmark.getCreatedAt())
                    .type(bookmark.getType())
                    .build())
                .collect(Collectors.toList());    
        }
     
        //북마크 여부 확인
        public boolean isBookmarked(Long memberId, Long itemId){
            if(memberId == null || itemId == null){
                return false;
            }
            return bookmarksRepository.existsByMemberIdAndItemId(memberId, itemId);
        }
    }

    //==기존 코드===============================================
    //int result=-1; //1. 에러 case
    //LocalDateTime createdAt = LocalDateTime.now();
    // //회원, 상품 상태 체크//_수정_
    // Optional<Member> op_m = memberRepository.findByMemberId(memberId);
    // Optional<Item> op_i = itemRepository.findById(itemId);
    // Member member = op_m.get();
    // Item item = op_i.get();

    //     //북마크 추가/삭제
	// 	Optional<Bookmarks> op_existingBookmark = bookmarksRepository.findByMemberIdAndItemId(memberId, itemId);

    //     if(!op_existingBookmark.isPresent()) {  //2. 추가 case
    //         Bookmarks bookmarks = new Bookmarks();

    //         bookmarks.setMember(member);
    //         bookmarks.setItem(item);
    //         bookmarks.setCreatedAt(createdAt);
    //         bookmarks.setType(type);

    //         bookmarksRepository.save(bookmarks);
    //         result=1;
    //     } else {  //3. 삭제 case
    //         Bookmarks existingBookmark = op_existingBookmark.get();
    //         bookmarksRepository.delete(existingBookmark);
    //         result=0;
    //     }

    //     return result;
	// }



    // //북마크 조회
    // //북마크 1개 가져오기 (다른 서비스들과의 연동을 위해 Bookmarks 형태로 반환)
	// public Bookmarks getBookmark(Long memberId, Long itemId) {
		
	// 	//1개 조회 실행
    //     Optional<Bookmarks> op = bookmarksRepository.findByMemberIdAndItemId(memberId, itemId);
    
    //     if(!op.isPresent()) {
    //         throw new CustomException(ErrorCode.BOOKMARK_NOT_FOUND);
    //     }

    //     Bookmarks bookmark = op.get();

    //     return bookmark;
		
	// }



    // //북마크 리스트 가져오기 (바로 화면에 띄워줄 데이터이므로 List<BookmarksDTO> 형태로 반환)
    // public List<BookmarksDTO> getMyBookmarkList(Long memberId){

    //     try {
    //         return bookmarksRepository.findByMemberId(memberId)
    //         .stream()
    //         .map(bookmark -> BookmarksDTO.builder()
    //             .bookmakrId(bookmark.getBookmakrId())
    //             .memberId(bookmark.getMember().getMemberId())
    //             .itemId(bookmark.getItem().getItemId()) 
    //             .createdAt(bookmark.getCreatedAt())
    //             .type(bookmark.getType())
    //             .build())
    //         .collect(Collectors.toList());
    //     } catch (Exception e) {
    //         e.printStackTrace();
	// 		return null;
    //     }

//     }

// }