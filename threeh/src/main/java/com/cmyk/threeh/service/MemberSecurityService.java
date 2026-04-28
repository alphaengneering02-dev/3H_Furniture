//<Spring Security 로그인>
package com.cmyk.threeh.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.enums.MemberRole;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberSecurityService implements UserDetailsService {
    private final MemberRepository memberRepository;
	
	@Override
	public UserDetails loadUserByUsername(String id) throws UsernameNotFoundException {
		
		//<사용자명으로(ID) Member 객체를 조회>
		Optional<Member> searchMember = memberRepository.findById(id);
		
		//사용자명에 해당하는 데이터가 없을 경우
		if(!searchMember.isPresent()) {
			ErrorCode error = ErrorCode.MEMBER_NOT_FOUND;
			System.out.println(error);
		}
		//사용자명에 해당하는 데이터가 있을 경우
		Member member = searchMember.get();
		
		
		
		// <사용자에게 권한을 부여하는 코드>
		List<GrantedAuthority> authorities = new ArrayList<GrantedAuthority>();  //권한 목록을 가져옴
		
		if("admin".equals(id)) {  //ADMIN 권한을 부여
			authorities.add(new SimpleGrantedAuthority(MemberRole.ADMIN.getKey()));
		} else {  //USER 권한을 부여
			authorities.add(new SimpleGrantedAuthority(MemberRole.USER.getKey()));
		}

		

        //<사용자 등록(아이디, 비밀번호, 권한)>
		return new User(member.getId(), member.getPassword(), authorities);
        
	}
}
