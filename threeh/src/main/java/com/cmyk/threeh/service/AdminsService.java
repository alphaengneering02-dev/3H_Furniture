package com.cmyk.threeh.service;



import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.dto.AdminsDTO;
import com.cmyk.threeh.enums.MemberRole;
import com.cmyk.threeh.repository.AdminsRepository;
import com.cmyk.threeh.repository.DeliveryRepository;
import com.cmyk.threeh.repository.OrderRepository;
import com.cmyk.threeh.domain.Orders;
import com.cmyk.threeh.domain.Delivery;
import com.cmyk.threeh.enums.DeliveryStatus;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminsService {

    private final PasswordEncoder passwordEncoder;
    private final AdminsRepository adminsRepository;
    private final OrderRepository orderRepository;
    private final DeliveryRepository deliveryRepository;

    // 관리자 등록
    @Transactional
    public Admins createAdmin(AdminsDTO dto) {

        Admins admin = new Admins();
        admin.setAdLoginId(dto.getAdLoginId());
        admin.setPassword(passwordEncoder.encode(dto.getPassword()));
        admin.setAdminName(dto.getAdminName());
        //권한 고정 (보안 강화: 외부 입력값과 상관없이 ADMIN으로 고정)
        // 일반 사용자가 실수로 관리자가 되는 것 방지
        admin.setRole(MemberRole.ADMIN);
        

        return adminsRepository.save(admin);
    }

    // AdminsService.java에 추가
    public Admins getAdminByLoginId(String loginId) {
        return adminsRepository.findByAdLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("해당 아이디의 관리자를 찾을 수 없습니다: " + loginId));
    }

     public Admins login(String loginId, String password) {

        Admins admin = adminsRepository.findByAdLoginId(loginId)
                .orElse(null);

        if (admin == null) {
            return null;
        }

        // 비밀번호 검증
        if (passwordEncoder.matches(password, admin.getPassword())) {
            return admin;
        }

        return null;
    }

    @Transactional
public void assignOrder(Long orderId, Long deliveryId) {

    Orders order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("주문 없음"));

    Delivery delivery = deliveryRepository.findById(deliveryId)
            .orElseThrow(() -> new RuntimeException("기사 없음"));

    // 이미 배정된 주문 방지
    if (order.getDelivery() != null) {
        throw new RuntimeException("이미 배정된 주문입니다.");
    }

    // 기사 상태 확인
    if (delivery.getStatus() != DeliveryStatus.WAITING) {
        throw new RuntimeException("대기 상태 기사가 아닙니다.");
    }

    // 핵심
    order.assignOrder(delivery);

    // 기사 상태 변경
    delivery.setStatus(DeliveryStatus.SHIPPING);

    System.out.println("배정 완료");
}

}