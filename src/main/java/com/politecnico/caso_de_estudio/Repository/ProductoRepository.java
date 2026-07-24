package com.politecnico.caso_de_estudio.Repository;

import com.politecnico.caso_de_estudio.Entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository <Producto, Long> {

   @Query("SELECT SUM(p.totalProducto) FROM Producto p")
    Optional<Double> totalInventario();
}
