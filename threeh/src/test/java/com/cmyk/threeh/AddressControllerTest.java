package com.cmyk.threeh;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;

import java.util.ArrayList;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser; // 💡 추가
import org.springframework.test.web.servlet.MockMvc;

import com.cmyk.threeh.controller.MemberAddressController;
import com.cmyk.threeh.service.MemberAddressService;

@WebMvcTest(MemberAddressController.class)
public class AddressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MemberAddressService memberAddressService;

    @Test
    @WithMockUser // 💡 중요: "가짜로 로그인한 유저"라고 속여서 401 에러를 방지합니다.
    public void 배송지목록조회() throws Exception {
        // Given
        given(memberAddressService.getAddressList(anyString()))
            .willReturn(new ArrayList<>());

        // When & Then
        mockMvc.perform(get("/Member/list")) 
                .andExpect(status().isOk()) // 이제 401 대신 200 OK가 뜰 거예요!
                .andExpect(view().name("mypage/address_list"))
                .andExpect(model().attributeExists("addressList"));
    }
}
