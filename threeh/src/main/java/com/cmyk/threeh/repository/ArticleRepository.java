package com.cmyk.threeh.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cmyk.threeh.domain.Article;

public interface ArticleRepository extends JpaRepository<Article,Long>{

    List<Article> findByMemberIdOrderByCreatedAtDesc(Long memberId);
    List<Article> findByItemIdOrderByCreatedAtDesc(Long itemId);
    List<Article> findAllByOrderByCreatedAtDesc();

    void deleteByMemberId(Long memberId);
    
}
