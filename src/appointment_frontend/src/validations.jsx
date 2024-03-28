import * as yup from 'yup'

const validations = yup.object().shape({
    email:yup
    .string()
    .email("Geçerli bir email giriniz")
    .required("Zorunlu alan"),
    name:yup
    .string()
    .min(5,"En az 3 karakter olmalıdır")
    .required(),
});

export default validations;