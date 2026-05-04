package com.cmyk.threeh.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Adress;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.MemberAddress;
import com.cmyk.threeh.domain.Orders;
import com.cmyk.threeh.dto.MemberAddressDTO;
import com.cmyk.threeh.enums.OrderState;
import com.cmyk.threeh.form.MemberAddressForm;
import com.cmyk.threeh.repository.MemberAddressRepository;
import com.cmyk.threeh.repository.OrderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberAddressService {
    
    private final MemberAddressRepository memberAddressRepository;
    private final MemberService memberService;
    private final OrderRepository orderRepository;

    // [기능: 배송지 수동 생성]
    public MemberAddress createMemberAddress(String userid, String addr, String addrDetail) {
        Member member = memberService.getUser(userid);
        MemberAddress memberAddress = new MemberAddress();
        memberAddress.setMember(member);

        // 조장님의 Adress VO 사용 (city, street, zipcode)
        memberAddress.setAdressl(new Adress("도시명", addr, ""));
        memberAddress.setAddrDetail(addrDetail);

        return memberAddressRepository.save(memberAddress);
    }

    // [기능: 배송지 저장 및 기본 배송지 변경]
    @Transactional
    public void saveAddress(String userid, MemberAddressForm form) {
        Member member = memberService.getUser(userid);

        // 기존 기본 배송지(Y)를 찾아 일반 배송지(N)로 바꿈
        memberAddressRepository.findByMember_MemberIdAndIsDefault(member.getMemberId(), "Y")
        .ifPresent(oldDefault -> oldDefault.setIsDefault("N"));

        MemberAddress address = new MemberAddress();
        address.setMember(member);
        address.setAdressl(new Adress("도시명", form.getAddr(), form.getZipcode()));
        address.setAddrDetail(form.getAddrDetail());
        address.setIsDefault("Y"); // 새 주소를 기본 배송지로 설정

        memberAddressRepository.save(address);
    }

    // [기능: 주소록 목록 조회]
    @Transactional
    public List<MemberAddressDTO> getAddressList(String userid) {
        Member member = memberService.getUser(userid);
        List<MemberAddressDTO> dtoList = new ArrayList<>();

        List<MemberAddress> addresses = memberAddressRepository.findByMember_MemberId(member.getMemberId());
        
        for(MemberAddress addr : addresses) {
            MemberAddressDTO dto = new MemberAddressDTO();
            dto.setAddrid(addr.getAddrId());
            dto.setMemberid(member.getMemberId());

            if(addr.getAdressl() != null) {
                // dto.setZipcode(addr.getAdressl().getZipcode());
                // dto.setAddr(addr.getAdressl().getStreet());
            }

            dto.setAddrdetail(addr.getAddrDetail());
            dto.setIsdefault(addr.getIsDefault());
            dtoList.add(dto);
        }
        return dtoList;
    }

    //구매내역 주소 조회 불러오기
    @Transactional
    public MemberAddressDTO getOrderDeliveryInfo(Long orderId) {

        Orders order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("주문 내역이 없습니다."));

        MemberAddressDTO dto = new MemberAddressDTO();
        dto.setMemberid(order.getMember().getMemberId());
        
        dto.setAddr(order.getDeliveryAddr());
        dto.setAddrdetail(order.getDeliveryAddrDetail());

        return dto;
    }

    //3일이 지나면 환불불가
    @Transactional
    public void processRefundOrDelete(Long orderId) {
    // 조장님의 Orders 엔티티 조회
    Orders order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("주문 내역이 없습니다."));

    
    // 주문 날짜 확인
    LocalDateTime orderDate = order.getOrderDate();
    
    // 날짜 비교 (주문일 + 3일이 현재 시간보다 이전이면 = 3일 경과)
    if (LocalDateTime.now().isAfter(orderDate.plusDays(3))) {
        // [메모장 요구사항] 3일 넘어가면 삭제
        orderRepository.delete(order);
    } else {
        // [메모장 요구사항] 3일 이내면 환불 처리 (상태 변경 등)
        order.setOrderState(OrderState.CANCEL); // 조장님 엔티티의 상태 변경
    }
}

    //마이페이지 수정
    @Transactional
    public int update_mypage(MemberAddressDTO member) throws Exception {
        return 0;
    }
}
