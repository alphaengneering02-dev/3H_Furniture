package com.cmyk.threeh.controller;

import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.global.util.MyUtil;
import com.cmyk.threeh.service.ItemService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;




@RestController
@RequiredArgsConstructor
@RequestMapping
public class ItemController {
    
    @Resource
    private final ItemService itemService;

    @Autowired
    MyUtil myUtil;

    //상품 등록

    @PostMapping("path")
    public String postMethodName(@RequestBody String entity) {
        
        return entity;
    }
    
    



}
