const errorHandler = (err, req, res, next) => {
    const timestamp = new Date().toISOString();

    console.error(`[${timestamp}] Error on ${req.method} ${req.originalUrl}`)
    console.error(err.stack);

    res.status(err.status || 500)
        .json({
            success: false,
            message: err.message || 'Internal Server Error',
            data: {}
        })
}

export default errorHandler;