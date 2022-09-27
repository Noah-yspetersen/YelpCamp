const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { campgroundSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');

const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground');

// This schema is used as a server side validation of the newly created/edited campground. They need to fill these parameters. If it goes well we call "next" and run the appropriate path.
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};

// INDEX PAGE - wait for all campgrounds to be found and then render them in "index.ejs"
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { campgrounds })
}));

// NEW PAGE - render "new.ejs" with a form etc
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new.ejs')
});

// "NEW PAGE" FORM SUBMISSION - The form from "new.ejs" gets submitted to /campgrounds as a post request. You then take the form info and define it to campground and then save it to the database. Then we redirect to the newly created campgrounds show page.
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Succesfully made a new Campground')
    res.redirect(`/campgrounds/${campground._id}`)
}));

// SHOW PAGE - Take the id from the specific campground your selecting using req.params.id and findById and pass it through to "show.ejs" as campground
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
        req.flash('error', 'No campground found');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show.ejs', { campground });
}));

// EDIT PAGE - Again we take the id from the specific campground your selecting using req.params.id and findById. That gets passed through to "edit.ejs" as campground
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'No campground found');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit.ejs', { campground });
}));

// "EDIT PAGE" FORM SUBMISSION - This is where our "edit.ejs" form get submitted to and via method-override as a put request, since html browser forms only can send "get" and "post" requests. We then findByIdAndUpdate, using the id as the first parameter and the new campground info (title, location) which is all stored under campground (see form) as the second. We then get redirected to the newly edited campgrounds show page.
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`)
}));

// "DELETE PAGE" FORM SUBMISSION - Our delete form is submitted to this exact campground (using the id) and as a delete request using method-override. We catch the id from req.params. Then we await the database to find that corresponding campground and delete it. We then get redirected back to the "index.ejs" page.
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground!')
    res.redirect('/campgrounds')
}));

module.exports = router;