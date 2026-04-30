package com.cmyk.threeh.service;



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

    private final AdminsRepository adminsRepository;

    // 관리자 등록
    @Transactional
    public Admins createAdmin(AdminsDTO dto) {

        Admins admin = new Admins();
        admin.setAdLoginId(dto.getAdLoginId());
        admin.setPassword(dto.getPassword());
        admin.setAdminName(dto.getAdminName());
/* 테스트 확인용 
        if (dto.getRole() != null) {
            admin.setRole(dto.getRole());
        } else {
            admin.setRole(MemberRole.ADMIN); 
        }
*/
        return adminsRepository.save(admin);
    }

    // 관리자 조회
    public Admins getAdmin(Long id) {
        return adminsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }
}