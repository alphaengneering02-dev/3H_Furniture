package com.cmyk.threeh.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ArticleDTO {
    
    private Long memberId;
    private Long itemId;
    private String articleTitle;
    private String articleContent;
}
