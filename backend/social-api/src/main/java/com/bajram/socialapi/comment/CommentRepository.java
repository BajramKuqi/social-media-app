package com.bajram.socialapi.comment;
import com.bajram.socialapi.post.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByPostOrderByCreatedAtDesc(Post post, Pageable pageable);
    long countByPost(Post post);

    @Transactional
    void deleteByPost(Post post);
}