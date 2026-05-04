package com.cmyk.threeh;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.dto.AdminsDTO;
import com.cmyk.threeh.service.AdminsService;

@SpringBootTest
@Transactional
public class AdminTest {

    @Autowired
    private AdminsService adminsService;

    @Test
    @DisplayName("관리자 생성 테스트")
    void createAdminTest() {

        // given
        AdminsDTO dto = new AdminsDTO();
        dto.setAdLoginId("test_admin");
        dto.setPassword("1234");
        dto.setAdminName("테스트관리자");

        // when
        Admins savedAdmin = adminsService.createAdmin(dto);

        // then
        assertThat(savedAdmin).isNotNull();
        assertThat(savedAdmin.getAdminId()).isNotNull();
        assertThat(savedAdmin.getAdLoginId()).isEqualTo("test_admin");
        assertThat(savedAdmin.getAdminName()).isEqualTo("테스트관리자");
    }

    @Test
    @DisplayName("관리자 조회 테스트")
    void getAdminTest() {

        // given
        AdminsDTO dto = new AdminsDTO();
        dto.setAdLoginId("find_admin");
        dto.setPassword("1234");
        dto.setAdminName("조회테스트");

        Admins savedAdmin = adminsService.createAdmin(dto);

        // when
        Admins foundAdmin = adminsService.getAdmin(savedAdmin.getAdminId());

        // then
        assertThat(foundAdmin.getAdminId()).isEqualTo(savedAdmin.getAdminId());
        assertThat(foundAdmin.getAdLoginId()).isEqualTo("find_admin");
        assertThat(foundAdmin.getAdminName()).isEqualTo("조회테스트");
    }
}