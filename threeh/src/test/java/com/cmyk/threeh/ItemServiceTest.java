package com.cmyk.threeh;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.dto.ItemRequestDTO;
import com.cmyk.threeh.dto.ItemResponseDTO;
import com.cmyk.threeh.dto.ItemUpdateRequestDTO;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.repository.AdminsRepository;
import com.cmyk.threeh.service.ItemService;


@SpringBootTest
@Transactional
public class ItemServiceTest {

    @Autowired
    private ItemService itemService;

    @Autowired
    private AdminsRepository adminsRepository;

    // 1. 생성 성공
    @Test
    void createItemTest() {

        ItemRequestDTO dto = ItemRequestDTO.builder()
                .category("table")
                .itemName("테이블")
                .price(340000)
                .stock(3)
                .discountPrice(0)
                .currency("KRW")
                .build();

        ItemResponseDTO result = itemService.createItems(dto, "admin1");

        assertEquals("테이블",result.getItemName());
        assertEquals(340000, result.getPrice());
    }

    // 2. 생성 실패
    @Test
    void createItemFailTest() {

        ItemRequestDTO dto = new ItemRequestDTO();

        assertThrows(CustomException.class, () -> {
            itemService.createItems(dto, "admin1");
        });
    }

    // 3. 수정 권한 테스트
    @Test
    void updateItemNotAdmin() {

        ItemRequestDTO dto = ItemRequestDTO.builder()
                .itemName("상품")
                .price(1000)
                .stock(10)
                .build();

        ItemResponseDTO saved = itemService.createItems(dto, "admin1");

        Admins admin2 = new Admins();
        admin2.setAdLoginId("admin2");
        admin2.setPassword("1234");
        admin2.setAdminName("관리자2");
        admin2.setRole("ADMIN");
        adminsRepository.saveAndFlush(admin2);

        ItemUpdateRequestDTO updateDto = new ItemUpdateRequestDTO();

        updateDto.setItemName("수정상품");

        assertThrows(CustomException.class,()-> {
            itemService.updateItem(saved.getItemId(), "admin2", updateDto);
        });

    }

    // 4. 삭제 권한 테스트
    @Test
    void deleteItemNotAdmin() {

        ItemRequestDTO dto = ItemRequestDTO.builder()
                .itemName("상품")
                .price(1000)
                .stock(10)
                .build();

        ItemResponseDTO saved = itemService.createItems(dto, "admin1");

        Admins admin2 = new Admins();
        admin2.setAdLoginId("admin2");
        admin2.setPassword("1234");
        admin2.setAdminName("관리자2");
        admin2.setRole("ADMIN");
        adminsRepository.saveAndFlush(admin2);

        assertThrows(CustomException.class,()-> {
            itemService.deleteItem(saved.getItemId(), "admin2");
        });
    }
}
