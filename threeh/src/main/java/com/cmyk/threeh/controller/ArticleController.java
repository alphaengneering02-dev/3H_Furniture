package com.cmyk.threeh.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cmyk.threeh.dto.ArticleAnswerDTO;
import com.cmyk.threeh.dto.ArticleDTO;
import com.cmyk.threeh.dto.ArticleResponseDTO;
import com.cmyk.threeh.service.ArticleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ArticleController {
    
    private final ArticleService articleService;

    // 상담 문의 등록
    @PostMapping
    public ResponseEntity<ArticleResponseDTO> createArticle(@RequestBody ArticleDTO dto) {
        ArticleResponseDTO response = articleService.createArticle(dto);
        return ResponseEntity.ok(response);
    }

    // 관리자 상담 문의 전체 목록
    @GetMapping
    public ResponseEntity<List<ArticleResponseDTO>> getAllArticles() {
        List<ArticleResponseDTO> articles = articleService.getAllArticles();
        return ResponseEntity.ok(articles);
    }

    // 회원별 상담 문의 목록
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<ArticleResponseDTO>> getArticlesByMemberId(@PathVariable Long memberId) {
        List<ArticleResponseDTO> articles = articleService.getArticlesByMemberId(memberId);
        return ResponseEntity.ok(articles);
    }

    // 상품별 상담 문의 목록
    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<ArticleResponseDTO>> getArticlesByItemId(@PathVariable Long itemId) {
        List<ArticleResponseDTO> articles = articleService.getArticlesByItemId(itemId);
        return ResponseEntity.ok(articles);
    }

    // 상담 문의 상세 조회
    @GetMapping("/{articleId}")
    public ResponseEntity<ArticleResponseDTO> getArticle(@PathVariable Long articleId) {
        ArticleResponseDTO article = articleService.getArticle(articleId);
        return ResponseEntity.ok(article);
    }
    
    // 관리자 상담 답변 등록
    @PutMapping("/{articleId}/answer")
    public ResponseEntity<ArticleResponseDTO> answerArticle(
            @PathVariable Long articleId,
            @RequestBody ArticleAnswerDTO dto
    ) {
        ArticleResponseDTO response =
                articleService.answerArticle(articleId, dto.getArticleAnswer());

        return ResponseEntity.ok(response);
    }

    //관리자 상담 문의 삭제
    @DeleteMapping("/{articleId}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long articleId){
        articleService.deleteArticle(articleId);
        return ResponseEntity.noContent().build();
    }

    //회원이 상담문의 삭제(회원의 상담 내역이 DB에서 삭제되고, 관리자 페이지에서도 사라져.)
    @DeleteMapping("/member/{memberId}")
    public ResponseEntity<Void> deleteArticlesByMemberId(@PathVariable Long memberId) {
        articleService.deleteArticlesByMemberId(memberId);
        return ResponseEntity.noContent().build();
    }
}