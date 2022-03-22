export function NumeroABytes(numero: number):string {
    let resultado = '';
    let comparador = numero;
    let conteo: number = 0;
    while((comparador/1024) >= 1){
      conteo ++;
      comparador = comparador /1024;
    }
    
    switch(conteo) {
      case 0:
        resultado = `${comparador.toFixed(2)} b`;
        break;
      case 1:
        resultado = `${comparador.toFixed(2)} Kb`;
        break;
      case 2:
        resultado = `${comparador.toFixed(2)} Mb`;
        break;
      case 3:
        resultado = `${comparador.toFixed(2)} Gb`;
        break;
      case 4:
        resultado = `${comparador.toFixed(2)} Tb`;
        break;

        default:
          resultado = `${comparador.toFixed(2)} ??`;
          break;
    }

    return resultado;
  }