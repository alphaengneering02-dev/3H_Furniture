package com.cmyk.threeh.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.dto.RegisterForm;
import com.cmyk.threeh.enums.MemberRole;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {
    
	private final MemberRepository memberRepository;
	private final PasswordEncoder passwordEncoder;  //비밀번호 암호화 
	

    //회원가입
    public Member create(RegisterForm form) {
		
		Member user = new Member();
		
		user.setId(form.getId());
		user.setName(form.getName());
		user.setEmail(form.getEmail());
		user.setPhone(form.getPhone());
		user.setRole(MemberRole.USER);  //권한: USER("ROLE_USER", "일반 고객")
		user.setRegNo(form.getRegNo());
		user.setCreatedAt(LocalDateTime.now());
		//수정일: 회원가입할 때는 null
		
		//Bcrypt 해싱 함수를 사용해서 비밀번호를 암호화
		user.setPassword(passwordEncoder.encode(form.getPassword()));
		
		memberRepository.save(user);
		
		return user;
		
	}
	
	
	
	//회원정보 가져오기
	public Member getUser(String id) {
		
		Optional<Member> Member = memberRepository.findById(id);
		
		if(!Member.isPresent()) {
			ErrorCode error = ErrorCode.MEMBER_NOT_FOUND;
			System.out.println(error);
			return null;
		}

		return Member.get();
		
	}

    
}