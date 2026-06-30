package com.bajram.socialapi.post;

import com.bajram.socialapi.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByAuthor(User author, Pageable pageable);

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.author.id IN " +
            "(SELECT f.following.id FROM Follow f WHERE f.follower = :user) " +
            "ORDER BY p.createdAt DESC")
    Page<Post> findFollowingFeed(@Param("user") User user, Pageable pageable);
}