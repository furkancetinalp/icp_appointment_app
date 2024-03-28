import * as yup from 'yup'

const emailvalidation = yup.object().shape({
    email:yup
    .string()
    .email("Geçerli bir email giriniz")
    .required("Zorunlu alan"),
});

export default emailvalidation;