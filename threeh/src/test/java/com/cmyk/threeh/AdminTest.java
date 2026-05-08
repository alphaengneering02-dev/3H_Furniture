package com.cmyk.threeh;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.dto.AdminsDTO;
import com.cmyk.threeh.repository.AdminsRepository;
import com.cmyk.threeh.service.AdminsService;

@SpringBootTest
@Transactional
public class AdminTest {

    @Autowired
    private AdminsService adminsService;

    @Autowired
    private AdminsRepository adminsRepository;

    @Test
    @DisplayName("관리자 생성 테스트")
    void createAdminTest() {
/* 
        // given
        String loginId = "test_admin_" + UUID.randomUUID();

        AdminsDTO dto = new AdminsDTO();
        dto.setAdLoginId(loginId);
        dto.setPassword("1234");
        dto.setAdminName("테스트관리자");

        // when
        Admins savedAdmin = adminsService.createAdmin(dto);

        // then (서비스 결과 검증)
        assertThat(savedAdmin).isNotNull();
        assertThat(savedAdmin.getAdminId()).isNotNull();
        assertThat(savedAdmin.getAdLoginId()).isEqualTo(loginId);
        assertThat(savedAdmin.getAdminName()).isEqualTo("테스트관리자");

        // DB 실제 저장 확인 (중요 포인트)
        Admins dbAdmin = adminsRepository.findById(savedAdmin.getAdminId())
        .orElseThrow(() -> new RuntimeException("Admin not found"));

        assertThat(dbAdmin.getAdLoginId()).isEqualTo(loginId);
    }

    @Test
    @DisplayName("관리자 조회 테스트")
    void getAdminTest() {

        // given
        String loginId = "find_admin_" + UUID.randomUUID();

        AdminsDTO dto = new AdminsDTO();
        dto.setAdLoginId(loginId);
        dto.setPassword("1234");
        dto.setAdminName("조회테스트");

        Admins savedAdmin = adminsService.createAdmin(dto);

        // when
        Admins foundAdmin = adminsService.getAdmin(savedAdmin.getAdminId());

        // then
        assertThat(foundAdmin).isNotNull();
        assertThat(foundAdmin.getAdminId()).isEqualTo(savedAdmin.getAdminId());
        assertThat(foundAdmin.getAdLoginId()).isEqualTo(loginId);
        assertThat(foundAdmin.getAdminName()).isEqualTo("조회테스트");
    }
*/
    @Test
@DisplayName("기존 DB에 있는 admin1 계정 조회 테스트")
void findExistingAdmin() {
    // given
    String existingLoginId = "admin1";

    // when
    // Repository에서 직접 아이디로 찾아봅니다.
    Admins admin = adminsRepository.findByAdLoginId(existingLoginId)
            .orElseThrow(() -> new RuntimeException("DB에 admin1이 없습니다!"));

    // then
    assertThat(admin.getAdLoginId()).isEqualTo(existingLoginId);
    assertThat(admin.getRole()).isEqualTo("ROLE_ADMIN"); // DB에 저장된 값과 비교
    System.out.println("조회된 관리자 이름: " + admin.getAdminName());
}

    }
}
