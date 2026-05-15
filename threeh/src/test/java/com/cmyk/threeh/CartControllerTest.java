package com.cmyk.threeh;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.cmyk.threeh.controller.CartController;
import com.cmyk.threeh.service.CartService;
import com.cmyk.threeh.dto.CartDTO;

@WebMvcTest(CartController.class)
public class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CartService cartService;

    @Test
    @WithMockUser
    public void 장바구니목록조회() throws Exception {
        // 1. 서비스 가짜 데이터 설정
        given(cartService.getCartDto("testuser01")).willReturn(new CartDTO());

        // 2. 요청 보낼 때 .sessionAttr을 사용해 가짜 세션 데이터를 넣습니다.
        mockMvc.perform(get("/mypage/cart")
                .sessionAttr("userid", "testuser01")) // 💡 세션에 아이디 강제 주입
                .andExpect(status().isOk()) 
                .andExpect(view().name("Cart")) 
                .andExpect(model().attributeExists("cart"));
    }
}
