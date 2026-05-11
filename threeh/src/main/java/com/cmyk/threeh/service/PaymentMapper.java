package com.cmyk.threeh.service;

import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import com.cmyk.threeh.domain.Payment;
import com.cmyk.threeh.dto.ChargingHistoryDTO;

public interface PaymentMapper {

    default List<ChargingHistoryDTO> chargingHistoryToChargingHIstoryResponse(List<Payment> chargingHistories) {

        if(chargingHistories == null) {
            return null;
        }

       return chargingHistories.stream()
            .map(payment -> {
                return ChargingHistoryDTO.builder()
                    .paymentHistoryId(payment.getPaymentId())
                    .amount(payment.getAmount())
                    .orderName(payment.getOrderName())
                    .createdAt(payment.getCreatedAt())
                    .isPaySuccessYN(payment.isPaySuccessYN())
                    .build();
            }).collect(Collectors.toList());
                
    }

    
}