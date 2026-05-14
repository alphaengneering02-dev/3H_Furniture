package com.cmyk.threeh.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.domain.Delivery;
import com.cmyk.threeh.domain.Orders;
import com.cmyk.threeh.dto.DeliveryDTO;
import com.cmyk.threeh.dto.DeliveryExcelDTO;
import com.cmyk.threeh.enums.DeliveryStatus;
import com.cmyk.threeh.enums.OrderState;
import com.cmyk.threeh.repository.AdminsRepository;
import com.cmyk.threeh.repository.DeliveryRepository;

@Service
@RequiredArgsConstructor
@Transactional 
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final AdminsRepository adminsRepository;

    // 생성
       public Delivery createDelivery(DeliveryDTO dto) {
        System.out.println("======> [시작] 기사 등록 프로세스");
        Delivery delivery = new Delivery();

        if (dto.getAdminId() != null) {
        Admins admin = adminsRepository.findById(dto.getAdminId())
                .orElseThrow(() -> new RuntimeException("관리자 정보가 없습니다."));
        delivery.setAdmin(admin);
    }

        // 3. 중복 체크
        if (deliveryRepository.existsByDeliveryPhone(dto.getDeliveryPhone())) {
            throw new RuntimeException("이미 등록된 핸드폰 번호입니다.");
        }
        if (deliveryRepository.existsByDeliveryCarNo(dto.getDeliveryCarNo())) {
            throw new RuntimeException("이미 등록된 차량 번호입니다.");
        }

        // 4. 데이터 매핑
        delivery.setCompanyName(dto.getCompanyName());
        delivery.setBusinessName(dto.getBusinessName());
        delivery.setBusinessPhone(dto.getBusinessPhone());
        delivery.setBusinessNo(dto.getBusinessNo());
        delivery.setBusinessAddr(dto.getBusinessAddr());
        delivery.setDeliveryName(dto.getDeliveryName());
        delivery.setDeliveryPhone(dto.getDeliveryPhone());
        delivery.setDeliveryCarNo(dto.getDeliveryCarNo());
        
        // 상태값 초기화 (필요한 경우)
        delivery.setStatus(DeliveryStatus.WAITING);

        System.out.println("======> [완료] DB 저장 직전");
        return deliveryRepository.save(delivery);
    }

    //전체 조회
    @Transactional(readOnly = true)
    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    //단건 상세 조회
    @Transactional(readOnly = true)
    public Delivery getDelivery(Long id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 배송업체를 찾을 수 없습니다."));
    }

    // 대기 중인 기사님들만 조회
    public List<Delivery> getWaitingDeliveries() {
        return deliveryRepository.findByStatus(DeliveryStatus.WAITING);
    }

    // 배송 완료된 기사님들만 조회
    public List<Delivery> getCompletedDeliveries() {
        return deliveryRepository.findByStatus(DeliveryStatus.COMPLETED);
    }

    //수정
    public Delivery updateDelivery(Long id, DeliveryDTO dto) {

    Delivery delivery = deliveryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("해당 배송업체가 존재하지 않습니다. id=" + id));

    Admins admin = adminsRepository.findById(dto.getAdminId())
            .orElseThrow(() -> new RuntimeException("관리자 정보가 없습니다."));

    delivery.setAdmin(admin);
    delivery.setCompanyName(dto.getCompanyName());
    delivery.setBusinessName(dto.getBusinessName());
    delivery.setBusinessPhone(dto.getBusinessPhone());
    delivery.setBusinessNo(dto.getBusinessNo());
    delivery.setBusinessAddr(dto.getBusinessAddr());
    delivery.setDeliveryName(dto.getDeliveryName());
    delivery.setDeliveryPhone(dto.getDeliveryPhone());
    delivery.setDeliveryCarNo(dto.getDeliveryCarNo());

    return deliveryRepository.save(delivery);
}



    // 삭제
    public void deleteDelivery(Long id) {
        // 1. 존재하는지 확인
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("삭제할 배송업체가 존재하지 않습니다. id=" + id));
        
        // 2. 삭제 실행
        deliveryRepository.delete(delivery);
    }

    //엑셀
    public void bulkInsert(List<DeliveryExcelDTO> list, Long adminId) {

    Admins admin = adminsRepository.findById(adminId)
            .orElseThrow(() -> new RuntimeException("관리자 정보가 없습니다."));

    for (DeliveryExcelDTO excelDto : list) {

        Delivery delivery = new Delivery();

        delivery.setAdmin(admin);

        delivery.setCompanyName(excelDto.getCompanyName());
        delivery.setBusinessName(excelDto.getBusinessName());
        delivery.setBusinessNo(excelDto.getBusinessNo());
        delivery.setBusinessPhone(excelDto.getBusinessPhone());
        delivery.setBusinessAddr(excelDto.getBusinessAddr());

        delivery.setDeliveryName(excelDto.getDeliveryName());
        delivery.setDeliveryPhone(excelDto.getDeliveryPhone());
        delivery.setDeliveryCarNo(excelDto.getDeliveryCarNo());

        // status 처리 핵심 위치
        delivery.setStatus(
            excelDto.getStatus() != null
                ? DeliveryStatus.valueOf(excelDto.getStatus())
                : DeliveryStatus.WAITING
        );

        deliveryRepository.save(delivery);
    }
}

@Transactional
public void assignDelivery(Long orderId, Long deliveryId) {
/* 
    Orders order = ordersRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("주문 없음"));
*/
    Delivery delivery = deliveryRepository.findById(deliveryId)
            .orElseThrow(() -> new RuntimeException("기사 없음"));
/* 
    // 이미 배정된 경우 방지
    if (order.getDelivery() != null) {
        throw new RuntimeException("이미 배정된 주문입니다.");
    }
*/
    // 기사 상태 체크
    if (delivery.getStatus() != DeliveryStatus.WAITING) {
        throw new RuntimeException("배정 불가능한 기사입니다.");
    }
/* 
    // 핵심 연결
    order.setDelivery(delivery);
    order.setOrderState(OrderState.SHIPPING);

    delivery.setStatus(DeliveryStatus.SHIPPING);
*/
    }



}



