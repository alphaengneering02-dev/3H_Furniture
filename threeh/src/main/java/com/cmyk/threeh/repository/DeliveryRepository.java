package com.cmyk.threeh.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.cmyk.threeh.domain.Delivery;
import com.cmyk.threeh.enums.DeliveryStatus;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long>{

    List<Delivery> findByStatus(DeliveryStatus status);
}