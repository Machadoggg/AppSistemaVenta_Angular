import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { MAT_DATE_FORMATS } from '@angular/material/core';
import * as moment from 'moment';

import * as XLSX  from "xlsx";

import { Reporte } from 'src/app/Interfaces/reporte';
import { VentaService } from 'src/app/Services/venta.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';


//configuracion calendario
export const MY_DATA_FORMATS={
  parse:{
    dateInput:'DD/MM/YYYY'
  },
  display:{
    dateInput:'DD/MM/YYYY',
    monthYearLabel:'MMMM YYYY'
  }
}


@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
  styleUrls: ['./reporte.component.css'],
  providers:[
    {provide:MAT_DATE_FORMATS, useValue:MY_DATA_FORMATS}
  ]
})
export class ReporteComponent implements OnInit, AfterViewInit{
  
  formularioFiltro:FormGroup;
  listaVentasReporte:Reporte[] = [];
  columnasTabla:string[] = ['fechaRegistro','numeroVenta','tipoPago','total','producto','cantidad','precio','totalProducto'];
  dataInicio:Reporte[]= [];
  datosVentaReporte = new MatTableDataSource(this.listaVentasReporte);
  @ViewChild(MatPaginator) paginacionTabla! : MatPaginator;


  constructor(
    private formBuilder:FormBuilder,
    private _ventaServicio:VentaService,
    private _utilidadServicio:UtilidadService

  ) {

    this.formularioFiltro = this.formBuilder.group({
      fechaInicio:['',Validators.required],
      fechaFin:['',Validators.required]

    })
  }


  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    this.datosVentaReporte.paginator = this.paginacionTabla; 
  }


  buscarVentas(){

      const _fechaInicio = moment(this.formularioFiltro.value.fechaInicio).format('DD/MM/YYYY');
      const _fechaFin = moment(this.formularioFiltro.value.fechaFin).format('DD/MM/YYYY');
    

      //validadacion de fechas
      if(_fechaInicio === "Invalid date" || _fechaFin === "Invalid date"){
        this._utilidadServicio.mostrarAlerta("Debe ingresar ambas fechas", "Oops!");
        return;
      }


      this._ventaServicio.reporte(
        _fechaInicio,
        _fechaFin
      ).subscribe({
        next:(data) => {
          if(data.status){
            this.listaVentasReporte = data.value;
            this.datosVentaReporte = data.value;
          }
          else{
            this.listaVentasReporte = [];
            this.datosVentaReporte.data = [];
            this._utilidadServicio.mostrarAlerta("No se encontraron datos", "Oops!")
          }
        },
        error:(e)=>{}
      })

  }


  exportarExcel(){
    const wbook = XLSX.utils.book_new();
    const wsheet = XLSX.utils.json_to_sheet(this.listaVentasReporte);

    XLSX.utils.book_append_sheet(wbook,wsheet,"Reporte");
    XLSX.writeFile(wbook,"Reporte Ventas.xlsx");
  }
  

}
