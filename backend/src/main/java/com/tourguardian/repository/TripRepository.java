package com.tourguardian.repository;

import com.tourguardian.entity.Trip;
import com.tourguardian.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByCreatorAndDeletedAtIsNull(User creator);
    List<Trip> findByCreatorOrderByCreatedAtDesc(User creator);
}
