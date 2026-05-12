package com.cmyk.threeh.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.cmyk.threeh.domain.Payment;
import com.cmyk.threeh.dto.ChargingHistoryDTO;

@Component
public class PaymentMapper {

    


    public List<ChargingHistoryDTO> chargingHistoryToChargingHistoryResponse(List<Payment> chargingHistories) {

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