import { signal } from '@angular/core';
import { form, schema, required, email, minLength } from '@angular/forms/signals';

const myModel = signal({ email: '', password: '' });
const myForm = form(myModel, schema((s) => {
    required(s.email);
    email(s.email);
    required(s.password);
    minLength(s.password, 8);
}));

const isValid: boolean = myForm().valid();
const emailInvalid: boolean = myForm.email().invalid();
