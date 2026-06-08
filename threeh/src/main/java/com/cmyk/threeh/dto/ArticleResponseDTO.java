package com.cmyk.threeh.dto;

import java.time.LocalDateTime;

import com.cmyk.threeh.domain.Article;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ArticleResponseDTO {
    
    //필드
    private Long articleId;
    private Long memberId;
    private Long itemId;
    private String articleTitle;
    private String articleContent;
    private Long viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updateAt;
    private String articleAnswer;
    private LocalDateTime answeredAt;
    private String articleStatus;

    //생성자
    public ArticleResponseDTO(Article article) {
        this.articleId = article.getArticleId();
        this.memberId = article.getMemberId();
        this.itemId = article.getItemId();
        this.articleTitle = article.getArticleTitle();
        this.articleContent = article.getArticleContent();
        this.viewCount = article.getViewCount();
        this.createdAt = article.getCreatedAt();
        this.updateAt = article.getUpdateAt();
        this.articleAnswer = article.getArticleAnswer();
        this.answeredAt = article.getAnsweredAt();
        this.articleStatus = article.getArticleStatus();
    }
}