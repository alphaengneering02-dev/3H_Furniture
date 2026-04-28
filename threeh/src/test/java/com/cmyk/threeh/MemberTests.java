package com.cmyk.threeh;

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
	void memberSave() {

		RegisterForm form = new RegisterForm();

		form.setId("user1");
		form.setPassword("a123");
		form.setName("테스트사용자1");
		form.setEmail("aaa@gmail.com");
		form.setPhone("010-1111-1111");
		form.setRegNo("123456-1234567");

		memberService.create(form);

	}


	@Test
	void memberFind() {

		Member member = memberService.getUser("user1");
		System.out.println(member);

	}

}
