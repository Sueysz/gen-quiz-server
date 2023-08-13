export const errorHandling = (res, error, errorMessage = 'An error has occurred') => {
    const errorTime = new Date().getTime();
    console.error("error:"+errorTime, error);
    res.status(500).json({ error: errorMessage, errorTime });
};
