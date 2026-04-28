//데이터 흐름: Repository -> Service -> Controller
package com.cmyk.threeh.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cmyk.threeh.domain.Member;


public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findById(String id);  //데이터 1개

    //spring security의 영향을 받음
    
}