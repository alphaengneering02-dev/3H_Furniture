package com.cmyk.threeh.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cmyk.threeh.domain.MemberAddress;


public interface MemberAddressRepository extends JpaRepository<MemberAddress, Long> {

    Optional<MemberAddress> findByAddrId(Long addrId);
    
} 
    

