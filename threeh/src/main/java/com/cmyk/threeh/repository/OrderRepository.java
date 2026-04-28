package com.cmyk.threeh.repository;




import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cmyk.threeh.domain.Orders;



@Repository
public interface OrderRepository extends JpaRepository<Orders, Long>{

   
}
