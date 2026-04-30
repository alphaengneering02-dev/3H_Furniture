package com.cmyk.threeh.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView; // 추가 필요
import lombok.RequiredArgsConstructor;
import com.cmyk.threeh.domain.Delivery;
import com.cmyk.threeh.dto.DeliveryDTO;
import com.cmyk.threeh.service.DeliveryService;

@RestController
@RequestMapping("/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping("/register")
    public ModelAndView registerPage() {
        return new ModelAndView("forward:/index.html");
    }

    // 기존 생성 로직 (JSON 데이터 처리)
    @PostMapping
    public Delivery create(@RequestBody DeliveryDTO dto) {
        return deliveryService.createDelivery(dto);
    }

    // 기존 조회 로직
    @GetMapping("/{id}")
    public Delivery get(@PathVariable Long id) {
        return deliveryService.getDelivery(id);
    }
}