export class TraduccionEntidad {
  singular: string;
  plural: string;
  prefijoPlural: string;
  prefijoSingular: string;

  constructor(datos: string) {
    const literales = datos.split('|');
    this.singular = literales[0];
    this.plural = literales[1];
    this.prefijoSingular = literales[2];
    this.prefijoPlural = literales[3];
  }
}
