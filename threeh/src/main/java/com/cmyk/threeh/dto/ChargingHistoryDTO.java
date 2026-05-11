package com.cmyk.threeh.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChargingHistoryDTO {
    
    private Long paymentHistoryId;

    @NonNull
    private Long amount;

    @NonNull
    private String orderName;

    private boolean isPaySuccessYN;

    private String createdAt;

}
