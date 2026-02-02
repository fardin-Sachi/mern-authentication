import TryCatch from "../middlewares/TryCatch.js";
import sanitize from "mongo-sanitize";
import {registerSchema} from "../lib/zod.js";

export const registerUser = TryCatch(async (req, res) => {
    const sanitizedBody = sanitize(req.body);

    const validation = registerSchema.safeParse(sanitizedBody);

    if(!validation.success) {
        const zodError = validation.error;

        let errorMessage = "Validation failed";
        let allErrors = [];

        if(zodError?.issues && Array.isArray(zodError.issues)) {
            allErrors = zodError.issues.map((issue) => ({
                field: issue.path? issue.path.join(".") : "unknown",
                message: issue.message || "Validation error",
                code: issue.code
            }));
            console.log(zodError.issues);

            errorMessage = allErrors[0]?.message || "Validation error";
        }

        return res.status(400).json({
            success: false,
            message: errorMessage,
            // error: allErrors,
            data: {}
        });
    }

    const { name, email, password } = validation.data;

    res.json({
        name,
        email,
        password
    });
})