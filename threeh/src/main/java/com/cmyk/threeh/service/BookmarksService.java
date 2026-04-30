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
import com.cmyk.threeh.dto.ItemResponseDTO;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.BookmarksRepository;
import com.cmyk.threeh.repository.ItemRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookmarksService {
    
    private final BookmarksRepository bookmarksRepository;
    private final MemberService memberService;
    // private final ItemRepository itemRepository;

	

	//북마크 추가
    public boolean create(String id, Long itemId, String type) {
		
		try {
			Bookmarks bookmarks = new Bookmarks();
            Member member = memberService.getUser(id);
            // Optional<Item> item = itemRepository.findById(itemId);
		
			bookmarks.setMember(member);
			// bookmarks.setItem(item);
			bookmarks.setCreatedAt(LocalDateTime.now());
			bookmarks.setType(type);
			
			bookmarksRepository.save(bookmarks);
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
		
	}


    //북마크 번호로 1개 가져오기
	public Bookmarks getBookmark(Long bookmakrId) {
		
		try {
			Optional<Bookmarks> op = bookmarksRepository.findByBookmakrId(bookmakrId);
		
			if(!op.isPresent()) {
				throw new CustomException(ErrorCode.BOOKMARK_NOT_FOUND);
			}

			return op.get();
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
		
	}


    // //회원 아이디로 1개 가져오기
	// public Bookmarks getBookmarkById(String id) {
		
	// 	try {
	// 		List<Bookmarks> bookmarks = bookmarksRepository.findById(id);
		
	// 		if(!op.isPresent()) {
	//			throw new CustomException(ErrorCode.BOOKMARK_NOT_FOUND);
	// 		}

	// 		return op.get();
	// 	} catch (Exception e) {
	// 		e.printStackTrace();
	// 		return null;
	// 	}
		
	// }


    //북마크 전체 조회
    public List<BookmarksDTO> getAllBookmarks(){

        try {
            return bookmarksRepository.findAll()
            .stream()
            .map(bookmark -> BookmarksDTO.builder()
                .bookmakrId(bookmark.getBookmakrId())
                .memberId(bookmark.getMember().getMemberId()) 
                .itemId(bookmark.getItem().getItemId()) 
                .createdAt(bookmark.getCreatedAt())
                .type(bookmark.getType())
                .build())
            .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
			return null;
        }

    }


	//북마크 삭제
	public boolean delete(Long bookmakrId) {
		
		try {
			Bookmarks bookmark = getBookmark(bookmakrId);

			bookmarksRepository.delete(bookmark);
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
		
	}

    
}