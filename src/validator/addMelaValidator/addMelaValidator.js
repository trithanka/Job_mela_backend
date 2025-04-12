const Joi = require("joi");

const addMelaValidator = (req, res, next) => {
    const schema = Joi.object({
        venueName: Joi.string().required().min(3),
        address: Joi.string().required().min(4),
        startDate: Joi.string().required(),
        endDate: Joi.string().required(),
    })

    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "bad request", error })
    }
    next();
}

module.exports=addMelaValidator;