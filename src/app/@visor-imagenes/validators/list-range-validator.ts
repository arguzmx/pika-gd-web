import { AbstractControl, ValidationErrors } from '@angular/forms';

export function listRangeValidator(min: number, max: number) {
  return (control: AbstractControl): ValidationErrors | null => {

    if(!control.value) { return null; }

    const value = control.value.split(',').map((v: string) => v.trim()) as string[] ;
    if (value.some(v => isNaN(Number(v)) || Number(v) < min || Number(v) > max)) {
      return { listRange: { value } };
    }
    return null;
  };
}