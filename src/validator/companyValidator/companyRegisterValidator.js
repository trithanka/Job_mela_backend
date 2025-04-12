const Joi = require("joi");

const companyRegisterValidator = (req, res, next) => {
    const schema = Joi.object({
        company_name: Joi.string().required().min(3),
        registration_no: Joi.string().required().min(4),
        phone_no: Joi.string().pattern(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),
        email: Joi.string().email().required(),
        address: Joi.string().required().min(4),
    })

    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "bad request", error })
    }
    next();
}

module.exports=companyRegisterValidator;