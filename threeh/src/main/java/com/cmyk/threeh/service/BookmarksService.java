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

	

	//북마크 토글 (추가/삭제)
    @Transactional
    public int toggle(BookmarksDTO dto) {

        int result=-1; //1. 에러 case

        //북마크 정보
        Long memberId = dto.getMemberId();
        Long itemId = dto.getItemId();
        LocalDateTime createdAt = LocalDateTime.now();
        String type = dto.getType();

		
        //회원, 상품 상태 체크
        Optional<Member> op_m = memberRepository.findByMemberId(memberId);
        Optional<Item> op_i = itemRepository.findById(itemId);
        Member member = op_m.get();
        Item item = op_i.get();

        if(member == null) throw new CustomException(ErrorCode.MEMBER_NOT_FOUND);
        if(item == null) throw new CustomException(ErrorCode.ITEM_NOT_FOUND);

        
        //북마크 추가/삭제
		Optional<Bookmarks> op_existingBookmark = bookmarksRepository.findByMemberIdAndItemId(memberId, itemId);

        if(!op_existingBookmark.isPresent()) {  //2. 추가 case
            Bookmarks bookmarks = new Bookmarks();

            bookmarks.setMember(member);
            bookmarks.setItem(item);
            bookmarks.setCreatedAt(createdAt);
            bookmarks.setType(type);

            bookmarksRepository.save(bookmarks);
            result=1;
        } else {  //3. 삭제 case
            Bookmarks existingBookmark = op_existingBookmark.get();
            bookmarksRepository.delete(existingBookmark);
            result=0;
        }

        return result;
	}



    //북마크 조회
    //북마크 1개 가져오기 (다른 서비스들과의 연동을 위해 Bookmarks 형태로 반환)
	public Bookmarks getBookmark(Long memberId, Long itemId) {
		
		//1개 조회 실행
        Optional<Bookmarks> op = bookmarksRepository.findByMemberIdAndItemId(memberId, itemId);
    
        if(!op.isPresent()) {
            throw new CustomException(ErrorCode.BOOKMARK_NOT_FOUND);
        }

        Bookmarks bookmark = op.get();

        return bookmark;
		
	}



    //북마크 리스트 가져오기 (바로 화면에 띄워줄 데이터이므로 List<BookmarksDTO> 형태로 반환)
    public List<BookmarksDTO> getMyBookmarkList(Long memberId){

        try {
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
        } catch (Exception e) {
            e.printStackTrace();
			return null;
        }

    }

}