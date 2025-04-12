const Joi = require("joi");

const registerValidator = (req, res, next) => {
    const schema = Joi.object({
        fullName: Joi.string().required(),
        fatherName: Joi.string().required(),
        contactNumber: Joi.string().pattern(/^[0-9]{10}$/).messages({'string.pattern.base': `Phone number must have 10 digits.`}).required(),
        emailAddress: Joi.string().email().required(),
        qualification: Joi.required(),
        dob: Joi.string().required(),
        area: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        pinCode: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
    })

    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "bad request", error })
    }
    next();
}

module.exports=registerValidator;
