package com.cmyk.threeh.controller;

import javax.annotation.Resource; 
import javax.servlet.http.HttpSession;
import javax.validation.Valid;

import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping; 
import org.springframework.web.bind.annotation.RequestMapping;

import com.cmyk.threeh.form.CartItemForm;
import com.cmyk.threeh.service.CartItemService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/cartItem")
public class CartItemController {

    @Resource
    private final CartItemService cartItemService;

    @PostMapping("/add") 
    public String addCartItem(@Valid CartItemForm cartItemForm,
                              BindingResult bindingResult,
                              HttpSession session) {

        if(bindingResult.hasErrors()) {
            return "redirect:/mypage/cart";
        }

        String userid = (String) session.getAttribute("userid");
        
        if(userid == null) {
            return "redirect:/user/login";
        }

        cartItemService.addCartItem(userid, cartItemForm);

        return "redirect:/mypage/cart";
    }
}
