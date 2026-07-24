package com.politecnico.caso_de_estudio.Entity;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Producto {


    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "El nombre del producto no puede estar vacio")
    private String nombre;

    @NotNull(message = "El precio del producto no puede estar vacio")
    private Double precio;

    @NotNull(message = "La cantidad no puede estar vacia")
    private Integer cantidad;

    private Integer cantidadInicial;

    @NotNull
    private Double totalProducto;


}
