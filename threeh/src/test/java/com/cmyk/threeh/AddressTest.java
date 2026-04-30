package com.cmyk.threeh;

// 조장님 방식의 검증(assertEquals)을 위한 필수 임포트
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import javax.transaction.Transactional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.dto.MemberAddressDTO;
import com.cmyk.threeh.enums.MemberRole;
import com.cmyk.threeh.form.MemberAddressForm;
import com.cmyk.threeh.repository.MemberRepository;
import com.cmyk.threeh.service.MemberAddressService;

@SpringBootTest
@Transactional
@Import(TestSecurityConfig.class)
public class AddressTest {

    @Autowired MemberAddressService memberAddressService;
    @Autowired MemberRepository memberRepository;

    @Test
    public void 배송지저장_검증() throws Exception {
        // given
        Member member = createMember();
        MemberAddressForm form = new MemberAddressForm();
        form.setZipcode("12345");
        form.setAddr("수원시 팔달구");
        form.setAddrDetail("3H 가구점 1층");

        // when
        memberAddressService.saveAddress(member.getId(), form);

        // then
        List<MemberAddressDTO> list = memberAddressService.getAddressList(member.getId());
        MemberAddressDTO getAddr = list.get(0);

        // 조장님 스타일: 상세 컬럼값 하나하나 검증
        assertEquals(1, list.size(), "목록 개수 검증");
        assertEquals("12345", getAddr.getZipcode(), "우편번호 검증");
        assertEquals("수원시 팔달구", getAddr.getAddr(), "기본주소 검증");
        assertEquals("3H 가구점 1층", getAddr.getAddrdetail(), "상세주소 검증");
    }

    private Member createMember() {
        Member member = new Member();
        member.setId("userAddressTest");
        member.setPassword("1234");
        member.setEmail("test@naver.com");
        member.setPhone("01012345678");
        member.setRegNo("9501011234567");
        member.setName("테스트유저");
        member.setRole(MemberRole.USER);
        memberRepository.save(member);
        return member;
    }
}
