const asyncHandler1 = (fn)=>{
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => next(error))
    }
}



const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        console.error("Error in asyncHandler:", error);
        res.status(500).json({ message: "Internal Server Error", success: false });
        
    }
}


export{asyncHandler, asyncHandler1};