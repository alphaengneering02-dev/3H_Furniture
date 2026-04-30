package com.cmyk.threeh;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ThreehApplicationTests {

	@BeforeAll
	static void setup() {
		System.setProperty("oracle.net.tns_admin", "D:/Wallet_swDB");
		System.setProperty("wallet.path", "D:/Wallet_swDB");
	}

	@Test
	void contextLoads() {
	}

	

}
