package com.cmyk.threeh.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.cmyk.threeh.domain.Delivery;
import com.cmyk.threeh.dto.DeliveryDTO;
import com.cmyk.threeh.service.DeliveryService;

@RestController
@RequestMapping("/admin/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    // 1. 배송 등록 (CREATE)
    @PostMapping("/")
    public Delivery create(@RequestBody DeliveryDTO dto) {
        return deliveryService.createDelivery(dto);
    }

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

    //수정
    @PutMapping("/{deliveryid}")
    public Delivery update(@PathVariable Long id, @RequestBody DeliveryDTO dto) {
    return deliveryService.updateDelivery(id, dto);
}

    // 6. 삭제 (DELETE)
    @DeleteMapping("/companies/{deliveryid}")
    public void delete(@PathVariable Long id) {
        deliveryService.deleteDelivery(id);
    }
}