package com.cmyk.threeh.controller;

import javax.annotation.Resource;
import javax.servlet.http.HttpSession;
import javax.validation.Valid;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.cmyk.threeh.form.MemberAddressForm;
import com.cmyk.threeh.service.MemberAddressService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/Member")
public class MemberAddressController {

    @Resource
    private final MemberAddressService memberAddressService;

    @GetMapping("/list")
    public String addressList(HttpSession session, Model model) {
        String userid = (String) session.getAttribute("userid");

        if(userid == null) userid = "testuser01";
        
        model.addAttribute("addressList", memberAddressService.getAddressList(userid));

        return "mypage/address_list";
    }

    @PostMapping("/add")
    public String addAddress(@Valid MemberAddressForm memberAddressForm,
                            BindingResult bindingResult,
                            HttpSession session) {

            if(bindingResult.hasErrors()) {
                return "mypage/address_form";
            }

            String userid = (String) session.getAttribute("userid");
            if(userid == null) userid = "testuser01";

                memberAddressService.saveAddress(userid, memberAddressForm);

                return "redirect:/Member/list";
        }

    
}
