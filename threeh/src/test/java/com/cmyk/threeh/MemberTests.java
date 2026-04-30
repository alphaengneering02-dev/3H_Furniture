package com.cmyk.threeh;

import javax.transaction.Transactional;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.service.MemberService;
import com.cmyk.threeh.dto.MemberDTO;

@SpringBootTest
@Import(TestSecurityConfig.class)
class MemberTests {

	@BeforeAll
	static void setup() {
		System.setProperty("oracle.net.tns_admin", "D:/Wallet_swDB");
		System.setProperty("wallet.path", "D:/Wallet_swDB");
	}


	@Autowired
	private MemberService memberService;

	@Test
	//@Transactional
	void memberCreate() {

		MemberDTO dto = new MemberDTO();

		dto.setId("user2");
		dto.setPassword("a123");
		dto.setName("회원2");
		dto.setEmail("bbb@gmail.com");
		dto.setPhone("010-2222-2222");
		dto.setRegNo("223456-1234567");

		boolean createFlag = memberService.create(dto);
		if(!createFlag) {
			System.out.println("회원정보 등록 실패: " + createFlag);
			return;
		}

		Member member = memberService.getUser("user2");
	
		System.out.println("회원정보 등록 성공: " + createFlag);
		System.out.printf(
			"%d, %s, %s, %s, %s, %s, %s, %s, %s, %s\n",
			member.getMemberId(), member.getId(), member.getPassword(), member.getName(), member.getEmail(), member.getPhone(), member.getRole(), member.getRegNo(), member.getCreatedAt(), member.getUpdatedAt()
		);

	}


	@Test
	// @Transactional
	void memberFind() {

		Member member = memberService.getUser("user2");
	
		System.out.println("회원조회 성공: ");
		System.out.printf(
			"%d, %s, %s, %s, %s, %s, %s, %s, %s, %s\n",
			member.getMemberId(), member.getId(), member.getPassword(), member.getName(), member.getEmail(), member.getPhone(), member.getRole(), member.getRegNo(), member.getCreatedAt(), member.getUpdatedAt()
		);

	}


	@Test
	void memberUpdate() {

		Member member = memberService.getUser("user2");
		MemberDTO dto = new MemberDTO();

		System.out.println("수정할 회원 아이디:" + member.getId());
		dto.setPassword("a123");
		dto.setName("회원3");
		dto.setEmail("ccc@gmail.com");
		dto.setPhone("010-3333-3333");
		dto.setRegNo("323456-1234567");

		boolean updateFlag = memberService.update(member, dto);

		if(!updateFlag) {
			System.out.println("회원정보 수정 실패: " + updateFlag);
			return;
		}

		System.out.println("회원정보 수정 성공: " + updateFlag);

	}


	@Test
	void memberDelete() {

		Member member = memberService.getUser("user2");

		System.out.println("삭제할 회원 아이디:" + member.getId());
		boolean deleteFlag = memberService.delete(member.getId());

		if(!deleteFlag) {
			System.out.println("회원정보 삭제 실패: " + deleteFlag);
			return;
		}

		System.out.println("회원정보 삭제 성공: " + deleteFlag);

	}


	@Test
	@Transactional
	void memberFindByEmail() {

		Member member = memberService.findMember("bbb@gmail.com");

		System.out.println("회원조회 성공: ");
		System.out.printf(
			"%d, %s, %s, %s, %s, %s, %s, %s, %s, %s\n",
			member.getMemberId(), member.getId(), member.getPassword(), member.getName(), member.getEmail(), member.getPhone(), member.getRole(), member.getRegNo(), member.getCreatedAt(), member.getUpdatedAt()
		);

	}


	// //=============================================================


	@Test
	@Transactional
	void findId() {

		MemberDTO dto = new MemberDTO();

		dto.setName("회원2");  //이름
		dto.setPhone("010-2222-2222");  //전화번호 또는 이메일
		// dto.setEmail("bbb@gmail.com");

		String result = memberService.findUserId(dto);
		if(result.isEmpty()) {
			System.out.println("아이디 찾기 실패: " + result);
			return;
		}

		System.out.println("아이디 찾기 성공: " + result);

	}


	@Test
	@Transactional
	void changePassword() {

		String id = "user2";
		String oldPassword = "111";
		String newPassword = "a123";

		System.out.println("재설정할 아이디:" + id);
		System.out.println("기존 pw:" + oldPassword);
		System.out.println("새로운 pw:" + newPassword);
		boolean changePasswordFlag  = memberService.changeUserPassword(id, oldPassword, newPassword);  //아이디, 기존 pw, 새로운 pw

		if(!changePasswordFlag) {
			System.out.println("비밀번호 재설정 실패: " + changePasswordFlag);
			return;
		}

		System.out.println("비밀번호 재설정 성공: " + changePasswordFlag);

	}


	@Test
	@Transactional
	void checkRole() {

		String result = memberService.checkMemberRole("user2");
		System.out.println("회원 role: " + result);

	}



}
