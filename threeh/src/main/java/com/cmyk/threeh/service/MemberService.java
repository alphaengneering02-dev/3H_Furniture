package com.cmyk.threeh.service;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import javax.management.RuntimeErrorException;
import javax.servlet.http.HttpSession;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.dto.MemberDTO;
import com.cmyk.threeh.dto.SessionMember;
import com.cmyk.threeh.enums.MemberRole;
import com.cmyk.threeh.form.SignupUpdateForm;
import com.cmyk.threeh.global.error.CustomException;
import com.cmyk.threeh.global.error.ErrorCode;
import com.cmyk.threeh.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {
    
    private final MemberRepository memberRepository;
	private final PasswordEncoder passwordEncoder;  //비밀번호 암호화


	//<계정 관리>
    //회원가입
	@Transactional
    public boolean create(SignupUpdateForm form) {
		
		//회원이 입력한 정보
		String id = form.getId();
		String name = form.getName();
		String email = form.getEmail();
		String phone = form.getPhone();
		MemberRole role = MemberRole.USER;
		String regNo = form.getRegNo();
		LocalDateTime createdAt = LocalDateTime.now();
		

		//중복체크
		boolean isExistId = memberRepository.existsById(id);
		boolean isExistEmail = memberRepository.existsByEmail(email);
		boolean isExistPhone = memberRepository.existsByPhone(phone);
		boolean isExistRegNo = memberRepository.existsByRegNo(regNo);

		if (isExistId) throw new CustomException(ErrorCode.MEMBER_FOUND);
		if (isExistEmail) throw new CustomException(ErrorCode.EMAIL_IS_EXIST);
		if (isExistPhone) throw new CustomException(ErrorCode.PHONE_IS_EXIST);
		if (isExistRegNo) throw new CustomException(ErrorCode.REGNO_IS_EXIST);


		//가입
		Member member = new Member();
	
		member.setId(id);
        member.setPassword(passwordEncoder.encode(form.getPassword1()));
		member.setName(name);
		member.setEmail(email);
		member.setPhone(phone);
		member.setRole(role);  //권한: USER("ROLE_USER", "일반 고객")
		member.setRegNo(regNo);
		member.setCreatedAt(createdAt);
		//수정일: 회원가입할 때는 null
		
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
	@Transactional
	public boolean update(Member member, SignupUpdateForm form) {

		member.setPassword(passwordEncoder.encode(form.getPassword1()));
		member.setName(form.getName());
		member.setEmail(form.getEmail());
		member.setPhone(form.getPhone());
		member.setRegNo(form.getRegNo());
		member.setUpdatedAt(LocalDateTime.now());

		memberRepository.save(member);
		return true;
		
	}


	//회원 탈퇴
	@Transactional
	public boolean delete(String id) {
		
		Optional<Member> op = memberRepository.findById(id);
		if(!op.isPresent()) {
			throw new CustomException(ErrorCode.MEMBER_NOT_FOUND);
		}
		Member member = op.get();

		memberRepository.delete(member);
		return true;
		
	}


	//로그인한 회원의 정보 가져오기
	public Member getLoginUser(Principal principal) {

		//로그인 정보에서 아이디 가져오기
		String id = principal.getName();

		//회원정보
		Optional<Member> op = memberRepository.findById(id);
		
		if(!op.isPresent()) {
			throw new CustomException(ErrorCode.MEMBER_NOT_FOUND);
		}

		return op.get();

	}



	//로그인한 회원의 role 가져오기
	public String checkMemberRole(Principal principal) {

		//로그인 정보에서 아이디 가져오기
		String id = principal.getName();

		//회원정보
		Optional<Member> op = memberRepository.findById(id);
		if(!op.isPresent()) {
			throw new CustomException(ErrorCode.MEMBER_NOT_FOUND);
		}
		Member member = op.get();


		//role 꺼내기 (ROLE_ADMIN, ROLE_USER)
        String UserRole = member.getRole().getKey();
		if(UserRole.isEmpty()) {
			throw new CustomException(ErrorCode.SOME_COLUMN_IS_NULL);
		}

        return UserRole;
    }
	


	//=============================================================


	//<계정 찾기>
	//이름으로 회원리스트 조회
	public List<Member> findUserByName(String name) {

		List<Member> list = memberRepository.findByName(name);
		return list;
		
	}


	//아이디 찾기 - 이름, 전화번호
	public String findUserIdByPhone(String name, String phone) {

		Optional<Member> op = Optional.empty();
		Member member = null;
		String result="";


		//op 가져오기
		op = memberRepository.findByNameAndPhone(name, phone);

		//op 데이터 추출
		if(!op.isPresent()) {
			throw new CustomException(ErrorCode.MEMBER_NOT_FOUND);
		}

		member = op.get();

		result = member.getId();
		return result;
		
	}


	//아이디 찾기 - 이름, 이메일
	public String findUserIdByEmail(String name, String email) {

		Optional<Member> op = Optional.empty();
		Member member = null;
		String result="";


		//op 가져오기
		op = memberRepository.findByNameAndEmail(name, email);

		//op 데이터 추출
		if(!op.isPresent()) {
			throw new CustomException(ErrorCode.MEMBER_NOT_FOUND);
		}

		member = op.get();

		result = member.getId();
		return result;
		
	}



	//비밀번호 재설정 - 아이디, 기존 비번, 새로운 비번
	@Transactional
	public String changeUserPassword(Member member, String oldPassword, String newPassword) {

		String encodedNewPassword = passwordEncoder.encode(newPassword);
		member.setPassword(encodedNewPassword);
		memberRepository.save(member);

		return newPassword;
		
	}

    
}