const TryCatch = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            res.status(500).send('Internal Server Error:', error);
        }
    }
}

export default TryCatch;