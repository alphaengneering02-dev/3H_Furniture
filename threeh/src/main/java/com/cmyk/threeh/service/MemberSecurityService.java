//<Spring Security 로그인>
package com.cmyk.threeh.service;

import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.CustomMemberDetails;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberSecurityService implements UserDetailsService {
    private final MemberRepository memberRepository;
	
	//DB의 회원정보를 가져오는 메소드
	@Override
	public UserDetails loadUserByUsername(String id) throws UsernameNotFoundException {
		
		// 엔티티의 컬럼명 id를 기준으로 회원을 찾습니다.
		Optional<Member> searchMember = memberRepository.findById(id);
		
		//사용자명에 해당하는 데이터가 없을 경우
		if(!searchMember.isPresent()) {
			throw new CustomException(ErrorCode.MEMBER_NOT_FOUND);
		}
		//사용자명에 해당하는 데이터가 있을 경우
		Member member = searchMember.get();
		

       // 찾은 엔티티를 CustomUserDetails에 담아서 시큐리티에 넘겨줍니다.
        return new CustomMemberDetails(member);
        
	}

}
