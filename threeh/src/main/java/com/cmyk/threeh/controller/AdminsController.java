package com.cmyk.threeh.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.domain.Delivery;
import com.cmyk.threeh.dto.DeliveryDTO;
import com.cmyk.threeh.repository.AdminsRepository;
import com.cmyk.threeh.service.AdminsService;
import com.cmyk.threeh.service.DeliveryService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminsController {

    private final DeliveryService deliveryService;
    private final AdminsService adminsService;
    private final AdminsRepository adminsRepository;


    @PostMapping("/delivery")
public ResponseEntity<?> addDelivery(@RequestBody DeliveryDTO dto) {
    System.out.println("======> 요청이 도착했습니다!");
    System.out.println("전달받은 adminId: " + dto.getAdminId());
    
    deliveryService.createDelivery(dto);
    
    System.out.println("======> 저장 성공!");
    return ResponseEntity.ok("성공");
}

    // 
     @GetMapping("/list")
    public List<Delivery> getAllDeliveries() {

    try {

        System.out.println("=== /admin/list 호출됨 ===");

        List<Delivery> list = deliveryService.getAllDeliveries();

        System.out.println("조회 건수: " + list.size());

        return list;

    } catch (Exception e) {

        System.out.println("🔥 에러 발생!");
        e.printStackTrace();

        throw e;
    }
}
/* 
    // 3. 단건 조회 (READ ONE)
    @GetMapping("/{id}")
    public Delivery getOne(@PathVariable Long id) {
        return deliveryService.getDelivery(id);
    }

    // 4. 대기 목록
    @GetMapping("/waiting")
    public List<Delivery> getWaiting() {
        return deliveryService.getWaitingDeliveries();
    }

    // 5. 완료 목록
    @GetMapping("/completed")
    public List<Delivery> getCompleted() {
        return deliveryService.getCompletedDeliveries();
    }
*/
   //수정
    @PutMapping("/delivery/{deliveryid}")
    public Delivery update(@PathVariable("deliveryid") Long id, @RequestBody DeliveryDTO dto) {
    return deliveryService.updateDelivery(id, dto);
}

    // 6. 삭제 (DELETE)
    @DeleteMapping("/delivery-companies/{deliveryid}")
    public void delete(@PathVariable("deliveryid") Long id) {
        deliveryService.deleteDelivery(id);
    }
     @GetMapping("/delivery/{id}")
    public Delivery getOne(@PathVariable("id") Long id) {
        return deliveryService.getDelivery(id);
    }

   @GetMapping("/api/admins/find-id/{loginId}")
    public ResponseEntity<Long> getAdminIdByLoginId(@PathVariable String loginId) {
        Long adminId = adminsRepository.findByAdLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("Admin not found"))
                .getAdminId();
        return ResponseEntity.ok(adminId);
    }
}