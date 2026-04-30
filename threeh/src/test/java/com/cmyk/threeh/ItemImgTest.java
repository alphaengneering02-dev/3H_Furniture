package com.cmyk.threeh;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.List;

import javax.transaction.Transactional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.domain.Item;
import com.cmyk.threeh.domain.ItemImg;
import com.cmyk.threeh.dto.ItemImgRequestDTO;
import com.cmyk.threeh.dto.ItemImgResponseDTO;
import com.cmyk.threeh.enums.MemberRole;
import com.cmyk.threeh.enums.SubImg;
import com.cmyk.threeh.repository.AdminsRepository;
import com.cmyk.threeh.repository.ItemImgRepository;
import com.cmyk.threeh.repository.ItemRepository;
import com.cmyk.threeh.service.AdminsService;
import com.cmyk.threeh.service.ItemImgService;
import com.cmyk.threeh.service.ItemService;


@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "payment.toss.test_client_api_key=test_ck_dummy",
    "payment.toss.test_secrete_api_key=test_sk_dummy",
    "payment.toss.success_url=http://localhost:8080/payment/success",
    "payment.toss.fail_url=http://localhost:8080/payment/fail"
})
public class ItemImgTest {
    
    @Autowired ItemImgService itemImgService;
    @Autowired ItemImgRepository itemImgRepository;

    @Autowired ItemService itemService;
    @Autowired ItemRepository itemRepository;

    @Autowired AdminsService adminsService;
    @Autowired AdminsRepository adminsRepository;

    

    @Test
    private Item createTestItemImg(){

        Admins admin = new Admins();

        admin.setAdLoginId("admin");
        admin.setPassword("1234");
        admin.setAdminName("관리자");
        admin.setRole(MemberRole.ADMIN);

        adminsRepository.save(admin);

        Item item = new Item();
        item.setAdmin(admin);
        item.setCategory("거실");
        item.setItemName("소파");
        item.setPrice(300000);
        item.setCurrency("KRW");
        item.setStock(5);

        return itemRepository.save(item);
    }

    @Test
    /* 
    public void 이미지등록테스트() throws Exception{

        //이미지 저장되는지 테스트

        Item item = createTestItem();

        ItemImgRequestDTO dto = new ItemImgRequestDTO();

        dto.setItemId(item.getItemId());
        dto.setImgName("t1.jpg");
        dto.setImgUrl("C:/VSCode/3H_Furniture/threeh/src/main/resources/static/static/images/t1.jpg");

        ItemImgResponseDTO result = itemImgService.createItemImg(dto);

        assertNotNull(result);
        assertEquals("t1.jpg", result.getImgName());

        System.out.println("이미지 등록 테스트 성공!!");
        
    }
    */

    /* 
    public void 상품별이미지조회테스트(){

        Item item = createTestItemImg();

        ItemImg img1 = new ItemImg();
        img1.setItem(item);
        img1.setImgName("t1.jpg");
        img1.setImgUrl("/static/static/images/t1.jpg");
        img1.setSubImg(SubImg.Y);

        itemImgRepository.save(img1);

        ItemImg img2 = new ItemImg();

        img2.setItem(item);
        img2.setImgName("t1_1.jpg");
        img2.setImgUrl("/static/static/images/t1.jpg");
        img2.setSubImg(SubImg.N);

        itemImgRepository.save(img2);
        
        //서비스 실행
        List<ItemImgResponseDTO> result = itemImgService.getItemImgs(item.getItemId());

        //검증
        assertEquals(2, result.size());
        System.out.println("상품별 이미지 조회 테스트 성공!");

    }
    */

    /* 
    public void 대표이미지조회테스트(){

        Item item = createTestItemImg();
        Item savedItem = itemRepository.save(item);

        //서브이미지
        ItemImg img1 = new ItemImg();

        img1.setItem(savedItem);
        img1.setImgName("detailImg");
        img1.setImgUrl("/static/static/images/t1_1.jpg");
        img1.setSubImg(SubImg.N);

        itemImgRepository.save(img1);

        //대표 이미지
        ItemImg mainImg = new ItemImg();

        mainImg.setItem(savedItem);
        mainImg.setImgName("mainImg");
        mainImg.setImgUrl("/static/static/images/t1.jpg");
        mainImg.setSubImg(SubImg.Y);

        itemImgRepository.save(mainImg);

        //대표이미지 조회
        ItemImgResponseDTO result = itemImgService.getMainImg(savedItem.getItemId());

        //검증
        assertEquals("mainImg", result.getImgName());
        assertEquals("/static/static/images/t1.jpg", result.getImgUrl());
        assertEquals(SubImg.Y, result.getSubImg());
       
        System.out.println("대표 이미지 조회 테스트 성공!");
    }
    */

    public void 이미지수정테스트(){

        Item item = createTestItemImg();
        item.setItemName("테스트 상품");
        Item savedItem = itemRepository.save(item);

        //이미지 생성
        ItemImg itemImg = new ItemImg();
        itemImg.setItem(savedItem);
        itemImg.setImgName("old.jpg");
        itemImg.setImgUrl("old-url");
        itemImg.setSubImgUrl("old-sub-url");
        itemImg.setSubImg(SubImg.Y);

        ItemImg savedImg = itemImgRepository.save(itemImg);

        //수정 DTO
        ItemImgRequestDTO updateDto = ItemImgRequestDTO.builder()
            .imgName("new.jpg")
            .imgUrl("new-url")
            .subImgUrl("new-sub-url")
            .build();

        //수정 실행
        ItemImgResponseDTO result = itemImgService.updateItemImg(savedImg.getItemImgId(), updateDto);

        //검증

        assertEquals("new.jpg", result.getImgName());
        assertEquals("new-url", result.getImgUrl());
        assertEquals("new-sub-url", result.getSubImgUrl());
    }
    

}
