const Joi = require("joi");

const updateCandidateValidator = (req, res, next) => {
    const schema = Joi.object({
        fullName: Joi.string().required(),
        fatherName: Joi.string().required(),
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

module.exports=updateCandidateValidator;