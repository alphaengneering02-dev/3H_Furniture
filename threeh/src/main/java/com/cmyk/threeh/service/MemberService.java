package com.cmyk.threeh.service;

import com.cmyk.threeh.repository.AdminsRepository;
import java.time.LocalDateTime;
import java.util.Optional;

import org.aspectj.weaver.patterns.TypePatternQuestions.Question;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.CustomMemberDetails;
import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.dto.MemberDTO;
import com.cmyk.threeh.enums.MemberRole;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {
    
    private final MemberRepository memberRepository;
	private final PasswordEncoder passwordEncoder;  //비밀번호 암호화


	//<계정 관리>
    //회원가입
    public boolean create(MemberDTO dto) {
		
		//회원이 입력한 정보
		String id = dto.getId();
		String name = dto.getName();
		String email = dto.getEmail();
		String phone = dto.getPhone();
		MemberRole role = MemberRole.USER;
		String regNo = dto.getRegNo();
		LocalDateTime createdAt = LocalDateTime.now();
		

		//중복체크
		boolean isExistId = memberRepository.existsById(id);
		boolean isExistEmail = memberRepository.existsByEmail(email);
		boolean isExistPhone = memberRepository.existsById(phone);
		boolean isExistRegNo = memberRepository.existsById(regNo);

		if (isExistId) throw new CustomException(ErrorCode.MEMBER_FOUND);
		if (isExistEmail) throw new CustomException(ErrorCode.EMAIL_IS_EXIST);
		if (isExistPhone) throw new CustomException(ErrorCode.PHONE_IS_EXIST);
		if (isExistRegNo) throw new CustomException(ErrorCode.REGNO_IS_EXIST);


		//가입
		Member member = new Member();
	
		member.setId(id);
		member.setName(name);
		member.setEmail(email);
		member.setPhone(phone);
		member.setRole(role);  //권한: USER("ROLE_USER", "일반 고객")
		member.setRegNo(regNo);
		member.setCreatedAt(createdAt);
		//수정일: 회원가입할 때는 null
		
		//Bcrypt 해싱 함수를 사용해서 비밀번호를 암호화
		member.setPassword(passwordEncoder.encode(dto.getPassword()));
		
		memberRepository.save(member);
		return true;
		
	}
	
	
	//회원정보 가져오기
	public Member getUser(String id) {
		
		Optional<Member> op = memberRepository.findById(id);
		
		if(!op.isPresent()) {
			throw new CustomException(ErrorCode.MEMBER_NOT_FOUND);
		}

		return op.get();
		
	}


	public Member findMember(String email) {
		
		Optional<Member> op = memberRepository.findByEmail(email);
		
		if(!op.isPresent()) {
			throw new CustomException(ErrorCode.MEMBER_NOT_FOUND);
		}

		return op.get();
		
	}


	//회원정보 수정
	public boolean update(Member member, MemberDTO dto) {

		member.setPassword(passwordEncoder.encode(dto.getPassword()));
		member.setName(dto.getName());
		member.setEmail(dto.getEmail());
		member.setPhone(dto.getPhone());
		member.setRegNo(dto.getRegNo());
		member.setUpdatedAt(LocalDateTime.now());

		memberRepository.save(member);
		return true;
		
	}


	//회원 탈퇴
	public boolean delete(String id) {
		
		Member member = getUser(id);

		memberRepository.delete(member);
		return true;
		
	}


	//회원 role 가져오기
	public String checkMemberRole(String id) {

		Member member = getUser(id);
        String UserRole = member.getRole().getKey();
		String result = null;

		switch (UserRole) {
			case "ROLE_ADMIN":
				result = "관리자";
				break;

			case "ROLE_USER":
				result = "일반 고객";
				break;
		
			default:
				throw new CustomException(ErrorCode.SOME_COLUMN_IS_NULL);  //회원정보에 누락된 항목 있음
		}

        return result;
    }
	


	//=============================================================


	//<계정 찾기>
	//아이디 찾기
	public String findUserId(MemberDTO dto) {
		
		String name = dto.getName();
		String phone = dto.getPhone();
		String email = dto.getEmail();
		Optional<Member> op = Optional.empty();
		Member member = null;
		String result="";


		//이름 input 검사
		if(name.isEmpty()) {
			throw new CustomException(ErrorCode.INPUT_NOT_CORRECT);
		}

		//전화번호 or 이메일로 op 가져오기
		if(phone!=null) {
			op = memberRepository.findByNameAndPhone(name, phone);
		} else {
			op = memberRepository.findByNameAndEmail(name, email);
		}

		//op 예외처리
		if(!op.isPresent()) {
			throw new CustomException(ErrorCode.MEMBER_NOT_FOUND);
		}

		//op에서 데이터 추출
		member = op.get();
		result = member.getId();

		return result;
		
	}



	//비밀번호 재설정
	public boolean changeUserPassword(String id, String oldPassword, String newPassword) {
		
		Member member = null;

		//1. 로그인 상태인지 검사한다.
		// (세션에 유저 정보가 올라가 있으면, 로그인 상태)

		//2. 회원가입이 되어있는 상태인지 검사한다. (세션 유저 정보에서 가져옴)
		member = getUser(id);
		if(member==null) {
			throw new CustomException(ErrorCode.MEMBER_NOT_FOUND);
		}

		//3. 기존 pw가 현재 사용자의 pw와 일치하는지 검사한다.
		if (!passwordEncoder.matches(oldPassword, member.getPassword())) {
			//일치하지 않는다면, 오류를 발생시킨다.
			throw new CustomException(ErrorCode.PASSWORD_NOT_SAME);
		}

		//4. 일치한다면, 새로운 pw를 암호화하여 변경한다.
		String encodedNewPassword = passwordEncoder.encode(newPassword);
		member.setPassword(encodedNewPassword);

		//5. DB 저장
		memberRepository.save(member);

		return true;
		
	}

    
}