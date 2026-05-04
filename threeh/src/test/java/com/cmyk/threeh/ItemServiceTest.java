package com.cmyk.threeh;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import javax.transaction.Transactional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.cmyk.threeh.dto.ItemRequestDTO;
import com.cmyk.threeh.dto.ItemResponseDTO;
import com.cmyk.threeh.dto.ItemUpdateRequestDTO;
import com.cmyk.threeh.service.ItemService;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@SpringBootTest
@Transactional
public class ItemServiceTest {
    
    @Autowired
    private ItemService itemService;
  
   /* @Test

    void createItemTest(){

        ItemRequestDTO dto = ItemRequestDTO.builder()
        .category("table")
        .itemName("테이블")
        .price(340000)
        .stock(3)
        .build();

        ItemResponseDTO result = itemService.createItems(dto,1L);

        //검증
    
        assertEquals("테이블", result.getItemName());

    }

    @Test
    void createItemFailTest(){

       ItemRequestDTO dto = new ItemRequestDTO();

        assertThrows(IllegalArgumentException.class,()->{
            itemService.createItems(dto, 99L);
        });
    }

    @Test
    void updateItemNotAdmin(){

     
    }

    @Test
    void deleteItemNotAdmin(){

        assertThrows(IllegalArgumentException.class, ()-> {
            itemService.deleteItem(1L, 3L);
        });
    }
    */
}
