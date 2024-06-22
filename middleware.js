const ensureLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in');
        req.session.lastPage = req.originalUrl;
        return res.redirect('/login');
    }
    return next();
};

export {
    ensureLoggedIn
};
