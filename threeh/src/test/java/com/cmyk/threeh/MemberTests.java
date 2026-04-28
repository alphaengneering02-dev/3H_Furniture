package com.cmyk.threeh;

import javax.transaction.Transactional;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.service.MemberService;
import com.cmyk.threeh.dto.RegisterForm;

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
	@Transactional
	void memberSave() {

		RegisterForm form = new RegisterForm();

		form.setId("user2");
		form.setPassword("a123");
		form.setName("테스트사용자2");
		form.setEmail("bbb@gmail.com");
		form.setPhone("010-2222-2222");
		form.setRegNo("223456-1234567");

		memberService.create(form);

		Member member = memberService.getUser("user2");
		System.out.println(member);

	}

}
