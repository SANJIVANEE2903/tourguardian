package com.tourguardian.repository;

import com.tourguardian.entity.EmergencyContact;
import com.tourguardian.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {
    List<EmergencyContact> findByUserAndDeletedAtIsNull(User user);
}
