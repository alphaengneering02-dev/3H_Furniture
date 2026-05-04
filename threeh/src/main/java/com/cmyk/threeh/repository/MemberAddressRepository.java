package com.cmyk.threeh.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cmyk.threeh.domain.MemberAddress;


public interface MemberAddressRepository extends JpaRepository<MemberAddress, Long> {

    //마이페이지 배송지 관리 목록에서 회원의 주소 보여줄때 사용
    List<MemberAddress> findByMember_MemberId(Long member);

    //쿠팡처럼 기본 배송지 정보를 자동으로 불러화 생성
    Optional<MemberAddress> findByMember_MemberIdAndIsDefault(Long memberId, String IsDefault);

    //주소록에서 특정 주소를 선택해 삭제하거나 내용을 수정할 때, 해당 주소의 고유 ID로 데이터를 찾습니다.
    Optional<MemberAddress> findByAddrId(Long addrId);
    
} 
    

