package com.politecnico.caso_de_estudio.Controller;

import com.politecnico.caso_de_estudio.Entity.Producto;
import com.politecnico.caso_de_estudio.Service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/producto")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    //Create
    @PostMapping("/crear")
    public ResponseEntity<Producto> crearProducto (@RequestBody Producto producto){

        Producto productoCreado = productoService.crearProducto(producto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(productoCreado);
    }
    //Read
    @GetMapping("/obtener-productos")
    public ResponseEntity<List<Producto> > buscarProducto (){

        List<Producto> lista = productoService.buscarProductos();

        if (lista.isEmpty()){
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity
                .ok(lista);
    }
    //ReadForId
    @GetMapping("/obtener-productos-por-id/{id}")
    public ResponseEntity<Producto>  buscarProductoPorId (@PathVariable Long id){

        Optional <Producto> producto = productoService.buscarProductoPorId(id);

        return producto.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity
                .notFound().build());

    }
    //DeletedForId
    @DeleteMapping("/borrar-producto-por-id/{id}")
    public ResponseEntity<Void> borrarProductoPorId (@PathVariable Long id){

        boolean fueEliminado = productoService.borrarProductoPorId(id);

        if (fueEliminado){
            return  ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }

    }

}
