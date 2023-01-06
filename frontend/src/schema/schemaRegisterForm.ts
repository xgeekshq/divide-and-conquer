import Joi from 'joi';

const SchemaRegisterForm = Joi.object({
  firstName: Joi.string().required().trim().min(2).messages({
    'string.min': 'Your name must have more than 1 character.',
    'any.required': 'Please insert your first name',
    'string.empty': 'Please insert your first name',
  }),
  lastName: Joi.string().required().trim().min(2).messages({
    'string.min': 'Your name must have more than 1 character.',
    'any.required': 'Please insert your last name',
    'string.empty': 'Please insert your last name',
  }),
  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .messages({
      'any.required': 'Please insert your email.',
      'string.email': 'This email is not valid.',
    }),
  password: Joi.string()
    .required()
    .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^A-Za-z0-9]).{8,}$/)
    .min(8)
    .messages({
      'string.min': 'Password must be at least 8 characters.',
      'any.required': 'Please insert your password',
      'string.empty': 'Please insert your password',
      'string.pattern.base':
        'Use at least 8 characters, upper and lower case letters, numbers and symbols like !“?$%^&).',
    }),
  passwordConf: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.required': 'Please enter a valid password.',
    'string.empty': 'Please enter a valid password.',
    'any.only': 'Confirm Password does not match',
  }),
});

export default SchemaRegisterForm;
