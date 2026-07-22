package com.politecnico.caso_de_estudio.Service;

import com.politecnico.caso_de_estudio.Entity.*;
import com.politecnico.caso_de_estudio.Exeption.ProductoNoEncontradoException;
import com.politecnico.caso_de_estudio.Repository.ProductoRepository;
import com.politecnico.caso_de_estudio.Repository.FacturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FacturaService {

    @Autowired
    private FacturaRepository facturaRepository;
    @Autowired
    private ProductoRepository productoRepository;

    public Factura crearFactura(Factura factura) {

        double totalFactura = 0.0;

        for (DetalleFactura detalle : factura.getDetalles()) {

            Producto producto = productoRepository.findById(detalle.getProducto().getId())
                    .orElseThrow(() -> new ProductoNoEncontradoException(detalle.getProducto().getId()));

            double subtotal = producto.getPrecio() * detalle.getCantidad();

            detalle.setProducto(producto);
            detalle.setSubtotal(subtotal);
            detalle.setFactura(factura);

            totalFactura += subtotal;
        }

        factura.setTotal(totalFactura);

        return facturaRepository.save(factura);
    }
}
