package com.cmyk.threeh.service;

import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.MemberAddress;
import com.cmyk.threeh.repository.MemberAddressRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberAddressService {
    
    private final MemberAddressRepository memberAddressRepository;
    private final MemberService memberService;

    public MemberAddress createMemberAddress(String userid, String addr, String addrDetail) {

        Member member = memberService.getUser(userid);

        MemberAddress memberAddress = new MemberAddress();
        memberAddress.setMember(member);
        memberAddress.setAddr(addr);
        memberAddress.setAddrDetail(addrDetail);

        return memberAddressRepository.save(memberAddress);

    }

}