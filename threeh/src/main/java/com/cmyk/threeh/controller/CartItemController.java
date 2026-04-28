package com.cmyk.threeh.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/cartItem")
public class CartItemController {

    @GetMapping("/list")
    public String cartItemList() {


        return "CartItem";
    }

    
}


