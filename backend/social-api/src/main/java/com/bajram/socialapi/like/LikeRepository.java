package com.bajram.socialapi.like;
import com.bajram.socialapi.post.Post;
import com.bajram.socialapi.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByUserAndPost(User user, Post post);
    Optional<Like> findByUserAndPost(User user, Post post);
    long countByPost(Post post);
    java.util.List<Like> findByPost(Post post);

    @Transactional
    void deleteByPost(Post post);
}