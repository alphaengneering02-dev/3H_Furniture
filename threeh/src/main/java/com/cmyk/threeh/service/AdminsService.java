package com.cmyk.threeh.service;



import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import com.cmyk.threeh.domain.Admins;
import com.cmyk.threeh.dto.AdminsDTO;
import com.cmyk.threeh.enums.MemberRole;
import com.cmyk.threeh.repository.AdminsRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminsService {

    private final PasswordEncoder passwordEncoder;
    private final AdminsRepository adminsRepository;

    // 관리자 등록
    @Transactional
    public Admins createAdmin(AdminsDTO dto) {

        Admins admin = new Admins();
        admin.setAdLoginId(dto.getAdLoginId());
        admin.setPassword(passwordEncoder.encode(dto.getPassword()));
        admin.setAdminName(dto.getAdminName());
        //권한 고정 (보안 강화: 외부 입력값과 상관없이 ADMIN으로 고정)
        // 일반 사용자가 실수로 관리자가 되는 것 방지
        admin.setRole(MemberRole.ADMIN.name());
        
/* 테스트 확인용 
        if (dto.getRole() != null) {
            admin.setRole(dto.getRole());
        } else {
            admin.setRole(MemberRole.ADMIN); 
        }
*/
        return adminsRepository.save(admin);
    }
/* 
    // 관리자 조회
    public Admins getAdmin(Long id) {
        return adminsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }
*/

    // AdminsService.java에 추가
    public Admins getAdminByLoginId(String loginId) {
        return adminsRepository.findByAdLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("해당 아이디의 관리자를 찾을 수 없습니다: " + loginId));
    }

}