package com.cmyk.threeh.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/Member")
public class MemberAddressController {

    @GetMapping("/list")
    public String memberlist() {


        


        return "MemberAddress";
    }
    
}
