package com.cmyk.threeh;

import org.assertj.core.util.Arrays;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import com.cmyk.threeh.controller.ItemController;
import com.cmyk.threeh.dto.ItemRequestDTO;
import com.cmyk.threeh.dto.ItemResponseDTO;
import com.cmyk.threeh.service.ItemService;
import com.fasterxml.jackson.databind.ObjectMapper;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import javax.transaction.Transactional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import java.util.ArrayList;
import java.util.List;

@WebMvcTest(ItemController.class)
@AutoConfigureMockMvc(addFilters = false)//SpringSecuriy 영향 제거
public class ItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ItemService itemService;

    @Autowired
    private ObjectMapper objectMapper;

   
    @Test
    
    void createItemTest() throws Exception{

    //상품등록 컨트롤러 테스트

          /*   String json = "{"
        +"\"category\":\"table\","
        +"\"itemName\":\"테이블\","
        +"\"itemDetail\":\"아주 큰 테이블\","
        +"\"itemColor\":\"black\","
        +"\"price\":500000,"
        +"\"discountPrice\":50000,"
        +"\"currency\":\"KRW\","
        +"\"stock\":3"
        +"}";*/ 

   ItemRequestDTO dto = ItemRequestDTO.builder()
    .category("table")
    .itemName("테이블")
    .itemDetail("설명")
    .itemColor("black")
    .price(500000)
    .discountPrice(50000)
    .currency("KRW")
    .stock(3)
    .build();

    String json = objectMapper.writeValueAsString(dto);


        when(itemService.createItems(any(), any()))
        .thenReturn(
            ItemResponseDTO.builder()
            .itemId(1L)
            .itemName("테이블")
            .price(500000)
            .stock(3)
            .build()
        );

        mockMvc.perform(post("/products")
                .contentType("application/json")
                .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemId").value(1L))
                .andExpect(jsonPath("$.itemName").value("테이블"))
                .andExpect(jsonPath("$.price").value(500000))
                .andExpect(jsonPath("$.stock").value(3));
    
    }
   

    @Test
    void getAllItemsTest() throws Exception{

        //GET 전체 조회 테스트

        List<ItemResponseDTO> list = new ArrayList<>();
        list.add(ItemResponseDTO.builder()
        .itemId(1L)
        .itemName("테이블")
        .price(500000)
        .stock(3)
        .build());

        when(itemService.getAllItems()).thenReturn(list);

        mockMvc.perform(get("/products"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].itemName").value("테이블"));


    }

    @Test
    void getItemTest() throws Exception{

        //Get단건 조회
        when(itemService.getItem(1L))
          .thenReturn(
            ItemResponseDTO.builder()
            .itemId(1L)
            .itemName("테이블")
            .price(500000)
            .stock(3)
            .build()
          );

          mockMvc.perform(get("/products/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.itemName").value("테이블"))
            .andExpect(jsonPath("$.price").value(500000));

    }

   /* @TEST
    void creatItemBadRequestTest() throws Exception{
        //잘못된 요청 테스트
        String json ="{"
        +"\"itemName\":\"테이블\""
        +"}";

        mockMvc.perform(post("/products")
        .contentType("application/json")
        .content(json))
        .andExpect(status().isBadRequest());

    } */

        @Test
        void updateItemTest() throws Exception{
            
            String json ="{"
            +"\"itemName\":\"수정된 테이블\","
            +"\"price\":600000,"
            +"\"stock\":5"
            +"}";

            when(itemService.updateItem(any(), any(), any()))
            .thenReturn(
                ItemResponseDTO.builder()
                    .itemId(1L)
                    .itemName("수정된 테이블")
                    .price(600000)
                    .stock(5)
                    .build()
            );

            mockMvc.perform(put("/products/1")
                    .contentType("application/json")
                    .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemName").value("수정된 테이블"))
                .andExpect(jsonPath("$.price").value(600000));

        }

    @Test
    void deleteItemTest() throws Exception {

        doNothing().when(itemService).deleteItem(any(), any());

        mockMvc.perform(delete("/products/1"))
            .andExpect(status().isOk());
    }

}
