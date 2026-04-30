//<Spring Security 로그인>
package com.cmyk.threeh.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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
	
	@Override
	public UserDetails loadUserByUsername(String id) throws UsernameNotFoundException {
		
		// 엔티티의 컬럼명 id를 기준으로 회원을 찾습니다.
		Optional<Member> searchMember = memberRepository.findById(id);
		
		//사용자명에 해당하는 데이터가 없을 경우
		if(!searchMember.isPresent()) {
			throw new CustomException(ErrorCode.MEMBER_FOUND);
		}
		//사용자명에 해당하는 데이터가 있을 경우
		Member member = searchMember.get();
		
		
		
		// DB에 있는 내 Role을 꺼내서, 시큐리티 권한에 등록하는 과정 (인가(Authorization))
		List<GrantedAuthority> authorities = new ArrayList<GrantedAuthority>();  //시큐리티 권한 목록을 가져옴
		authorities.add(new SimpleGrantedAuthority(member.getRole().getKey()));  //권한 목록에 role 등록

		

       // 찾은 엔티티를 CustomUserDetails에 담아서 시큐리티에 넘겨줍니다.
        return new CustomMemberDetails(member);
        
	}
}
