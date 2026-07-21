package com.politecnico.caso_de_estudio.Service;

import com.politecnico.caso_de_estudio.Entity.Producto;
import com.politecnico.caso_de_estudio.Repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {
    @Autowired
    private ProductoRepository productoRepository;

    //Create
    public Producto crearProducto (Producto producto){
        return productoRepository.save(producto);
    }
    //Read
    public List<Producto> buscarProductos (){
        return productoRepository.findAll();
    }
    //ReadForId
    public Optional<Producto> buscarProductoPorId (Long id){
        return  productoRepository.findById(id);
    }
    //DeletedForId
    public Boolean borrarProductoPorId (Long id){

        if (productoRepository.existsById(id)){
            productoRepository.deleteById(id);
            return true;
        } else {
            return false;
        }

    }
}
