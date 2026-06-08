package com.cmyk.threeh.service;

import java.util.List;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cmyk.threeh.domain.Article;
import com.cmyk.threeh.dto.ArticleDTO;
import com.cmyk.threeh.dto.ArticleResponseDTO;
import com.cmyk.threeh.repository.ArticleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ArticleService {
    
    private final ArticleRepository articleRepository;

    @Transactional
    public ArticleResponseDTO createArticle(ArticleDTO dto){
        Article article = new Article();

        article.setMemberId(dto.getMemberId());
        article.setItemId(dto.getItemId());
        article.setArticleTitle(dto.getArticleTitle());
        article.setArticleContent(dto.getArticleContent());
        article.setArticleStatus("WAITING");

        Article savedArticle = articleRepository.save(article);

        return new ArticleResponseDTO(savedArticle);
    }

     @Transactional(readOnly = true)
    public List<ArticleResponseDTO> getAllArticles() {
        return articleRepository.findAllByOrderByCreatedAtDesc()
            .stream()
            .map(ArticleResponseDTO::new)
            .collect(Collectors.toList());
    }

    @Transactional
    public ArticleResponseDTO answerArticle(Long articleId, String articleAnswer) {
        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상담글입니다."));

        article.setArticleAnswer(articleAnswer);
        article.setAnsweredAt(LocalDateTime.now());
        article.setArticleStatus("ANSWERED");
        article.setUpdateAt(LocalDateTime.now());

        return new ArticleResponseDTO(article);
    }

    @Transactional
    public List<ArticleResponseDTO> getArticlesByMemberId(Long memeberId){

        return articleRepository.findByMemberIdOrderByCreatedAtDesc(memeberId)
            .stream()
            .map(ArticleResponseDTO::new)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ArticleResponseDTO> getArticlesByItemId(Long itemId){
        return articleRepository.findByItemIdOrderByCreatedAtDesc(itemId)
            .stream()
            .map(ArticleResponseDTO::new)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public ArticleResponseDTO getArticle(Long articleId){
        
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상담글입니다."));

        return new ArticleResponseDTO(article);
    }

    @Transactional
    public void deleteArticle(Long articleId){
        Article article = articleRepository.findById(articleId)
            .orElseThrow(()-> new IllegalArgumentException("존재하지 않는 상담글입니다."));

            articleRepository.delete(article);
    }

    @Transactional
    public void deleteArticlesByMemberId(Long memberId) {
        articleRepository.deleteByMemberId(memberId);
    }

}
