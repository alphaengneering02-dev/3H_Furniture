package com.cmyk.threeh.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView; 
import lombok.RequiredArgsConstructor;
import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.dto.AdminsDTO;
import com.cmyk.threeh.service.AdminsService;

@RestController
@RequestMapping("/admin") 
@RequiredArgsConstructor
public class AdminsController {

    private final AdminsService adminsService;

   /* 
    @GetMapping("/dashboard")
    public ModelAndView adminDashboardPage() {      
        return new ModelAndView("forward:/index.html");
    }*/

        @GetMapping("/dashboard")
        public String dashboard() {
            return "123";
        }

    // 상품 등록 페이지 진입 (리액트 라우팅 연결)
    @GetMapping("/additems")
    public ModelAndView addProductPage() {
        return new ModelAndView("forward:/index.html");
    }

    // 상품 수정 페이지 진입 (ID를 받아 해당 상품 수정 화면으로)
    @GetMapping("/edititems/{itemId}")
    public ModelAndView editProductPage(@PathVariable Long itemId) {
        return new ModelAndView("forward:/index.html");
    }

    // 기존 등록 API
    @PostMapping
    public Admins create(@RequestBody AdminsDTO dto) {
        return adminsService.createAdmin(dto);
    }

    // 기존 조회 API
    @GetMapping("/{id}")
    public Admins get(@PathVariable Long id) {
        return adminsService.getAdmin(id);
    }
}