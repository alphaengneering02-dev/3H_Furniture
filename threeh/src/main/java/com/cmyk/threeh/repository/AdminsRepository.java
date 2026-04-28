package com.cmyk.threeh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.cmyk.threeh.domain.Admins;

@Repository
public interface AdminsRepository extends JpaRepository<Admins, Long> {
   
}


