package com.cmyk.threeh.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.cmyk.threeh.domain.Admins;
import java.util.List;



@Repository
public interface AdminsRepository extends JpaRepository<Admins,Long> {
   
    Optional<Admins> findByAdLoginId(String adLoginId);

}