import wrap from 'express-async-handler';
import passport from 'passport';

import User from '../models/User.js';

class AuthController {

    getRegister = (req, res) => {
        res.locals.userInput = req.session.userInput || {};
        res.render('auth/register');
    };

    register = wrap(async (req, res) => {
        try {
            const { username, email, password } = req.body.user;
            const user = await new User({ email, username });
            const registeredUser = await User.register(user, password);
            req.login(registeredUser, (err) => {
                if (err) {
                    return next(err);
                }
                delete req.session.userInput;
                req.flash('success', 'Welcome to YelpCamp!');
                res.redirect('/campgrounds');
            });
        }
        catch (err) {
            req.flash('error', err.message);
            req.session.userInput = req.body.user;
            return res.redirect('/register');
        }
    });

    getLogin = (req, res) => {
        res.render('auth/login');
    };

    login = wrap(async (req, res) => {
        passport.authenticate('local', {
            failureFlash: true,
            failureRedirect: '/login',
            keepSessionInfo: true
        })(req, res, async () => {
            if (req.session.lastPage) {
                const redirectUrl = req.session.lastPage;
                delete req.session.lastPage;
                res.redirect(redirectUrl);
            } else {
                req.flash('success', 'Welcome back!');
                res.redirect('/campgrounds');
            }
        });
    });

    logout = (req, res) => {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'See you!');
            res.redirect('/campgrounds');
        });
    };
}

export default new AuthController();
