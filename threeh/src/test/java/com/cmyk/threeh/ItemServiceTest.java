package com.cmyk.threeh;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import javax.transaction.Transactional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties.Admin;
import org.springframework.boot.test.context.SpringBootTest;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.dto.ItemRequestDTO;
import com.cmyk.threeh.dto.ItemResponseDTO;
import com.cmyk.threeh.dto.ItemUpdateRequestDTO;
import com.cmyk.threeh.repository.AdminsRepository;
import com.cmyk.threeh.service.ItemService;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@SpringBootTest
@Transactional
public class ItemServiceTest {
    
    @Autowired
    private ItemService itemService;

    @Autowired
    private AdminsRepository adminsRepository;
  
   @Test

    void createItemTest(){

        Admins admin = new Admins();
        admin.setAdLoginId("admin1");
        admin.setPassword("admin1");
        admin.setAdminName("관리자");
        admin.setRole("ADMIN");
        adminsRepository.save(admin);

        ItemRequestDTO dto = ItemRequestDTO.builder()
        .category("table")
        .itemName("테이블")
        .price(340000)
        .stock(3)
        .build();

        ItemResponseDTO result = itemService.createItems(dto,"admin1");

        //검증
    
        assertEquals("테이블", result.getItemName());

    }

 /* 
    @Test
    void createItemFailTest(){

       ItemRequestDTO dto = new ItemRequestDTO();

        assertThrows(IllegalArgumentException.class,()->{
            itemService.createItems(dto,"admin2");
        });
    }
*/

/* 
    @Test
    void updateItemNotAdmin(){
        
        Admins admin = new Admins();
        admin.setAdLoginId("admin1");
        admin.setPassword("admin1");
        admin.setAdminName("관리자");
        admin.setRole("ADMIN");
        adminsRepository.save(admin);

         Admins admin2 = new Admins();
        admin2.setAdLoginId("admin2");
        admin2.setPassword("admin2");
        admin2.setAdminName("관리자2");
        admin2.setRole("ADMIN");
        adminsRepository.save(admin2);

        ItemRequestDTO dto = ItemRequestDTO.builder()
        .itemName("상품")
        .price(1000)
        .stock(10)
        .build();

        ItemResponseDTO saved = itemService.createItems(dto, "admin1");

        ItemUpdateRequestDTO updateDto = new ItemUpdateRequestDTO();
        updateDto.setItemName("수정상품");

        assertThrows(IllegalArgumentException.class,()->{
            itemService.updateItem(saved.getItemId(), "admin2", updateDto);
        });
     
    }
*/

/* 
    @Test
    void deleteItemNotAdmin(){

        Admins admin = new Admins();
        admin.setAdLoginId("admin1");
        admin.setPassword("admin1");
        admin.setAdminName("관리자");
        admin.setRole("ADMIN");
        adminsRepository.save(admin);

        Admins admin2 = new Admins();
        admin2.setAdLoginId("admin2");
        admin2.setPassword("admin2");
        admin2.setAdminName("관리자2");
        admin2.setRole("ADMIN");
        adminsRepository.save(admin2);

        ItemRequestDTO dto = ItemRequestDTO.builder()
        .itemName("상품")
        .price(1000)
        .stock(10)
        .build();

        ItemResponseDTO saved = itemService.createItems(dto, "admin1");

        assertThrows(IllegalArgumentException.class,()->{
            itemService.deleteItem(saved.getItemId(), "admin2");
        });
    }
    */
  
}
