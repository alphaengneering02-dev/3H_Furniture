package com.cmyk.threeh.dto;

import javax.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemImgResponseDTO {
    
    @NotNull
    private Long itemImgId;

    private String imgName;
    private String imgUrl;
    private String subImgUrl;
    private String subImgYn;

}
//이미지 조회 응답용 DTO