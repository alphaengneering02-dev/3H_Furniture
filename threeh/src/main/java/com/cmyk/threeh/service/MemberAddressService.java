package com.cmyk.threeh.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

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

    // 배송지 저장 로직
    @Transactional
    public void saveAddress(String userid, MemberAddressForm form) {
        Member member = memberService.getUser(userid);

        // 기본 배송지 설정 처리
        if ("Y".equals(form.getIsDefault())) {
            memberAddressRepository.findByMember_MemberIdAndIsDefault(member.getMemberId(), "Y")
                .ifPresent(oldDefault -> oldDefault.setIsDefault("N"));
        }

        MemberAddress address = new MemberAddress();
        address.setMember(member);
        
        // 조장님 Adress VO 설정 (city, street, zipcode)
        address.setAdressl(new Adress(form.getCity(), form.getStreet(), form.getZipcode()));
        address.setAddr(form.getCity() + " " + form.getStreet()); 
        address.setAddrDetail(form.getAddrDetail());
        address.setIsDefault(form.getIsDefault() != null ? form.getIsDefault() : "N");
        
        memberAddressRepository.save(address);
    }

    // 주소록 목록 조회
    @Transactional
    public List<MemberAddressDTO> getAddressList(String userid) {
        Member member = memberService.getUser(userid);
        List<MemberAddressDTO> dtoList = new ArrayList<>();
        List<MemberAddress> addresses = memberAddressRepository.findByMember_MemberId(member.getMemberId());
        
        for(MemberAddress addr : addresses) {
            MemberAddressDTO dto = new MemberAddressDTO();
            dto.setAddrid(addr.getAddrId());
            dto.setMemberid(member.getMemberId());
            dto.setAddrdetail(addr.getAddrDetail());
            dto.setIsdefault(addr.getIsDefault());
            
            // DB에 없는 필드라면 DTO 매핑에서도 제외하거나 빈 값 처리
            // dto.setAddressName(addr.getAddressName()); 

            dtoList.add(dto);
        }
        return dtoList;
    }

    // 구매내역 주소 조회 (Orders 연동)
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

    // 3일 환불/삭제 로직
    @Transactional
    public void processRefundOrDelete(Long orderId) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문 내역이 없습니다."));

        LocalDateTime orderDate = order.getOrderDate();
        
        if (LocalDateTime.now().isAfter(orderDate.plusDays(3))) {
            orderRepository.delete(order); 
        } else {
            order.setOrderState(OrderState.CANCEL); 
        }
    }

    // 기본배송지 자동 연동
    @Transactional
    public MemberAddressDTO getDefaultAddressForOrder(String userid) {
        Member member = memberService.getUser(userid);
        
        return memberAddressRepository.findByMember_MemberIdAndIsDefault(member.getMemberId(), "Y")
                .map(addr -> {
                    MemberAddressDTO dto = new MemberAddressDTO();
                    
                    //식별 ID 및 회원 ID
                    dto.setAddrid(addr.getAddrId());
                    dto.setMemberid(member.getMemberId());

                    //주소 문자열 및 상세 정보
                    dto.setAddr(addr.getAddr());
                    dto.setAddrdetail(addr.getAddrDetail());
                    dto.setIsdefault(addr.getIsDefault());
                    //필요시 추가 매핑
                    //dto.setAddressName(addr.getAddressName());
                    //dto.setReceiverName(addr.getReceiverName());
                    //dto.setReceiverPhone(addr.getReceiverPhone());

                    return dto;
                }).orElseThrow(() -> new NoSuchElementException("기본 주소지를 설정해주세요"));
            }

    //배송/설치 일정 변경 처리
    @Transactional
    public void updateDeliverySchedule(Long orderId, LocalDate newDate) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문 내역이 없습니다."));

        // 조장님의 OrderState가 'ORDER'(배송전)일 때만 수정 가능
        // 만약 배송중, 배송완료 상태라면 수정 불가 처리
        if (order.getOrderState() == OrderState.ORDER) {
            order.setDeliveryDate(newDate);
            order.setInstallDate(newDate); // 설치일도 배송일과 동일하게 변경
        } else {
            throw new IllegalStateException("배송이 이미 시작되어 일정을 변경할 수 없습니다.");
        }
    }

    }

