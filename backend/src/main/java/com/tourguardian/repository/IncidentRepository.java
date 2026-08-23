package com.tourguardian.repository;

import com.tourguardian.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByStatusOrderByCreatedAtDesc(Incident.IncidentStatus status);
    List<Incident> findByLocationOrderByCreatedAtDesc(String location);
}
