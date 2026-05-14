package com.cmyk.threeh.service;



import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.domain.Orders;
import com.cmyk.threeh.dto.AdminsDTO;
import com.cmyk.threeh.enums.DeliveryStatus;
import com.cmyk.threeh.enums.MemberRole;
import com.cmyk.threeh.enums.OrderState;
import com.cmyk.threeh.repository.AdminsRepository;
import com.cmyk.threeh.repository.DeliveryRepository;
import com.cmyk.threeh.repository.OrderRepository;

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
/* 
    @Transactional
public void assignOrder(Long orderId, Long deliveryId) {

    Orders order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("주문 없음"));

    // 1. 상태 검증 (중요)
    if (!order.getOrderState().equals(OrderState.READY)) {
        throw new IllegalStateException("READY 상태만 배정 가능");
    }

    // 2. 기사 배정
    order.setDeliveryId(deliveryId);

    // 3. 배송 상태 시작
    order.setDeliveryStatus(DeliveryStatus.WAITING);

    orderRepository.save(order);
}

    @Transactional // 데이터 변경이 일어나므로 반드시 추가
public void assignOrder(Long orderId, Long deliveryId) {
        
    System.out.println("주문 번호 " + orderId + "번에 기사 " + deliveryId + "번 배정 로직 실행");
}

@Transactional
public void startShipping(Long orderId) {

    Orders order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("주문 없음"));

    if (order.getDeliveryStatus() != DeliveryStatus.WAITING) {
        throw new IllegalStateException("WAITING 상태만 배송 시작 가능");
    }

    order.setDeliveryStatus(DeliveryStatus.SHIPPING);
}

@Transactional
public void completeDelivery(Long orderId) {

    Orders order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("주문 없음"));

    if (order.getDeliveryStatus() != DeliveryStatus.SHIPPING) {
        throw new IllegalStateException("SHIPPING 상태만 완료 가능");
    }

    order.setDeliveryStatus(DeliveryStatus.COMPLETED);
}


*/
}