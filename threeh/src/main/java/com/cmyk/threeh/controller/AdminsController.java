package com.cmyk.threeh.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.domain.Delivery;
import com.cmyk.threeh.dto.DeliveryDTO;
import com.cmyk.threeh.service.AdminsService;
import com.cmyk.threeh.service.DeliveryService;

import java.util.List;

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
    private final AdminsService adminsService; // 추가


    // 1. 배송 등록 (CREATE)
    @PostMapping("/delivery")
    public Delivery create(@RequestBody DeliveryDTO dto) {
        return deliveryService.createDelivery(dto);
    }

/* 
    // 2. 전체 조회 (READ ALL)
    @GetMapping("/list")
    public List<Delivery> getAll() {
        return deliveryService.getAllDeliveries();
    }

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
    public void delete(@PathVariable Long id) {
        deliveryService.deleteDelivery(id);
    }
     @GetMapping("/delivery/{id}")
    public Delivery getOne(@PathVariable Long id) {
        return deliveryService.getDelivery(id);
    }

}