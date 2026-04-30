package com.cmyk.threeh.controller;

import com.cmyk.threeh.service.CartItemService;
import javax.annotation.Resource;
import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.dto.CartDTO;
import com.cmyk.threeh.service.CartService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/mypage")
public class CartController {

    @Resource
    private final CartService cartService;

    //장바구니 목록조회
    @GetMapping("/cart")
    public String cartList(HttpSession session, Model model) {

        String userId = (String) session.getAttribute("userid");

        if(userId == null) {
            return "redirect:/user/login";
        }

        CartDTO cartDTO = cartService.getCartDto(userId);
        model.addAttribute("cart",cartDTO);

        return "Cart";
    }

    //장바구니 상품 삭제
    @PostMapping("/cart/delete/{cartItemId}")
    public String deleteCartItem(@PathVariable Long cartItemId) {

        cartService.deleteCartItem(cartItemId);

        return "redirect:/mypage/cart";

    }

    //장바구니 수량 변경
    @PostMapping("/cart/update")
    public String updateCount(@RequestParam Long cartItemId, @RequestParam int count) {

        cartService.updateCount(cartItemId, count);

        return "redirect:/mypage/cart";
    }
    
}
