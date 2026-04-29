//데이터 흐름: Repository -> Service -> Controller
package com.cmyk.threeh.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cmyk.threeh.domain.Member;


public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findById(String id);  //데이터 1개

    //아이디 찾기
    Optional<Member> findByNameAndPhone(String name, String phone);
    Optional<Member> findByNameAndEmail(String name, String email);

    //비밀번호 찾기
    Optional<Member> findByIdAndPhone(String name, String phone);
    Optional<Member> findByIdAndEmail(String name, String email);

    //spring security의 영향을 받음
    
}