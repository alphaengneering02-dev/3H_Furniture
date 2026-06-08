package com.cmyk.threeh.domain;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

@Entity
@Table(name = "ARTICLE")
@Getter
@Setter
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "article_seq")
    @SequenceGenerator(
            name = "article_seq",
            sequenceName = "ARTICLE_SEQ",
            allocationSize = 1
    )
    @Column(name = "ARTICLE_ID")
    private Long articleId;

    @Column(name = "MEMBER_ID")
    private Long memberId;

    @Column(name = "ITEM_ID")
    private Long itemId;

    @Column(name = "ARTICLE_TITLE", nullable = false, length = 255)
    private String articleTitle;

    @Column(name = "ARTICLE_CONTENT", nullable = false, length = 2000)
    private String articleContent;

    @Column(name = "VIEW_COUNT")
    private Long viewCount;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATE_AT")
    private LocalDateTime updateAt;

    @Column(name = "ARTICLE_ANSWER", length = 2000)
    private String articleAnswer;

    @Column(name = "ANSWERED_AT")
    private LocalDateTime answeredAt;

    @Column(name = "ARTICLE_STATUS", length = 30)
    private String articleStatus;

    @PrePersist
    public void prePersist() {
        this.viewCount = 0L;
        this.createdAt = LocalDateTime.now();
        this.updateAt = LocalDateTime.now();
        
        if (this.articleStatus == null) {
        this.articleStatus = "WAITING";
    }
    }

    @PreUpdate
    public void preUpdate() {
        this.updateAt = LocalDateTime.now();
    }
}