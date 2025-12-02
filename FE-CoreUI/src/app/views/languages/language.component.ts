import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

interface Language {
  id: number;
  name: string;
  locale: string;
  flag: string;
  status: 'active' | 'disable';
}

@Component({
  selector: 'app-languages',
  standalone: true,
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class LanguageComponent {
  form!: FormGroup;
  editing: boolean = false;
  editId: number | null = null;

  languages: Language[] = [

  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: [''],
      locale: [''],
      flag: [''],
      status: ['active']
    });
  }

  submit() {
    if (this.form.invalid) return;

    if (this.editing) {
      // update
      const index = this.languages.findIndex(l => l.id === this.editId);
      this.languages[index] = { id: this.editId!, ...this.form.value };
    } else {
      // create
      const newItem: Language = {
        id: Date.now(),
        ...this.form.value
      };
      this.languages.push(newItem);
    }

    this.reset();
  }

  edit(item: Language) {
    this.editing = true;
    this.editId = item.id;
    this.form.patchValue(item);
  }

  remove(id: number) {
    this.languages = this.languages.filter(l => l.id !== id);
    if (this.editId === id) this.reset();
  }

  reset() {
    this.editing = false;
    this.editId = null;
    this.form.reset({ status: 'active' });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.form.patchValue({ flag: reader.result as string });
    };
    reader.readAsDataURL(file);
  }
}
