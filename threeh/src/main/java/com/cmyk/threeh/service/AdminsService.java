package com.cmyk.threeh.service;



import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.dto.AdminsDTO;
import com.cmyk.threeh.enums.MemberRole;
import com.cmyk.threeh.repository.AdminsRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminsService {

    private final PasswordEncoder passwordEncoder;
    private final AdminsRepository adminsRepository;

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
        
/* 테스트 확인용 
        if (dto.getRole() != null) {
            admin.setRole(dto.getRole());
        } else {
            admin.setRole(MemberRole.ADMIN); 
        }
*/
        return adminsRepository.save(admin);
    }
/* 
    // 관리자 조회
    public Admins getAdmin(Long id) {
        return adminsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }
*/

    // AdminsService.java에 추가
    public Admins getAdminByLoginId(String loginId) {
        return adminsRepository.findByAdLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("해당 아이디의 관리자를 찾을 수 없습니다: " + loginId));
    }

    @Transactional // 데이터 변경이 일어나므로 반드시 추가
public void assignOrder(Long orderId, Long deliveryId) {
    // 1. 주문 엔티티 조회 (OrderRepository가 필요합니다)
    // Order order = orderRepository.findById(orderId)
    //     .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다."));

    // 2. 기사 엔티티 조회
    // Delivery delivery = deliveryRepository.findById(deliveryId)
    //     .orElseThrow(() -> new RuntimeException("기사를 찾을 수 없습니다."));

    // 3. 배정 로직 (엔티티 구조에 맞게 구현)
    // order.setDelivery(delivery);
    // order.setOrderSate(OrderType.SHIPPING);
    
    System.out.println("주문 번호 " + orderId + "번에 기사 " + deliveryId + "번 배정 로직 실행");
}

}