export interface PropiedadesExtendidas {
    Propiedades: PropiedadExtendida[];
    ValoresEntidad?: ValoresEntidad[];
}

export interface PropiedadExtendida {
    PlantillaId: string;
    Id: string;
    Nombre: string;
    TipoDatoId: string;
}

export interface ValoresEntidad {
    Id: string;
    Valores: string[];    
}