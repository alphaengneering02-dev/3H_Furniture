package com.cmyk.threeh.service;

import java.util.ArrayList;
import java.util.List;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.cmyk.threeh.domain.Member;
import com.cmyk.threeh.domain.MemberAddress;
import com.cmyk.threeh.dto.MemberAddressDTO;
import com.cmyk.threeh.form.MemberAddressForm;
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

    @Transactional
    public void saveAddress(String userid, MemberAddressForm form) {

        Member member = memberService.getUser(userid);

        MemberAddress address = new MemberAddress();

        address.setMember(member);
        address.setZipcode(form.getZipcode());
        address.setAddr(form.getAddr());
        address.setAddrDetail(form.getAddrDetail());
        address.setIsDefault("N");

        memberAddressRepository.save(address);

    }

    @Transactional
    public List<MemberAddressDTO> getAddressList(String userid) {

        Member member = memberService.getUser(userid);

        List<MemberAddressDTO> dtoList = new ArrayList<>();

        for(MemberAddress addr : member.getMemberAddressList()) {
            MemberAddressDTO dto = new MemberAddressDTO();

            dto.setAddrid(addr.getAddrId());
            dto.setMemberid(member.getMemberId());
            dto.setZipcode(addr.getZipcode());
            dto.setAddr(addr.getAddr());
            dto.setAddrdetail(addr.getAddrDetail());
            dto.setIsdefault(addr.getIsDefault());

            dtoList.add(dto);
    }

    return dtoList;

}

}
