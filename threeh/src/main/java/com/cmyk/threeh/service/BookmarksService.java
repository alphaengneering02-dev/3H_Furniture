package com.cmyk.threeh.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Bookmarks;
import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.dto.BookmarksDTO;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.BookmarksRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookmarksService {
    
    private final BookmarksRepository bookmarksRepository;

	

	//북마크 토글 (추가/삭제)
    public int toggle(BookmarksDTO dto) {

        int toggleFlag=-1; //1. case 에러

        //북마크 정보
        Member member = dto.getMember();
        Item item = dto.getItem();
        LocalDateTime createdAt = LocalDateTime.now();
        String type = dto.getType();

		
        //회원, 상품 상태 체크
        if(member == null) throw new CustomException(ErrorCode.MEMBER_NOT_FOUND);
        if(item == null) throw new CustomException(ErrorCode.ITEM_NOT_FOUND);

        
        //북마크 추가/삭제
		Optional<Bookmarks> op_existingBookmark = bookmarksRepository.findByMemberAndItem(member, item);

        if(!op_existingBookmark.isPresent()) {  //2. case 추가
            Bookmarks bookmarks = new Bookmarks();

            bookmarks.setMember(member);
            bookmarks.setItem(item);
            bookmarks.setCreatedAt(createdAt);
            bookmarks.setType(type);

            bookmarksRepository.save(bookmarks);
            toggleFlag=1;
        } else {  //3. case 삭제
            Bookmarks existingBookmark = op_existingBookmark.get();
            bookmarksRepository.delete(existingBookmark);
            toggleFlag=0;
        }

        return toggleFlag;
	}



    //북마크 조회
    //북마크 1개 가져오기
	public Bookmarks getBookmark(Member member, Item item) {
		
		try {
			Optional<Bookmarks> op = bookmarksRepository.findByMemberAndItem(member, item);
		
			if(!op.isPresent()) {
				throw new CustomException(ErrorCode.BOOKMARK_NOT_FOUND);
			}

            Bookmarks bookmark = op.get();

			return bookmark;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
		
	}



    //북마크 리스트 가져오기
    public List<BookmarksDTO> getMyBookmarkList(Member member){

        try {
            return bookmarksRepository.findByMember(member)
            .stream()
            .map(bookmark -> BookmarksDTO.builder()
                .bookmakrId(bookmark.getBookmakrId())
                .member(bookmark.getMember())
                .item(bookmark.getItem()) 
                .createdAt(bookmark.getCreatedAt())
                .type(bookmark.getType())
                .build())
            .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
			return null;
        }

    }

}