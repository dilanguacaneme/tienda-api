package com.politecnico.caso_de_estudio.Repository;

import com.politecnico.caso_de_estudio.Entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository <Producto, Long> {
}
