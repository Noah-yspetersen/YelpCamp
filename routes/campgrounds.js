const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

const Campground = require('../models/campground');

// INDEX PAGE
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', { campgrounds })
}));

// NEW PAGE - render "new.ejs" with a form etc
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new.ejs')
});

// "NEW PAGE" FORM SUBMISSION 
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Succesfully made a new Campground')
    res.redirect(`/campgrounds/${campground._id}`)
}));

// SHOW PAGE
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');
    console.log(campground)
    if (!campground) {
        req.flash('error', 'No campground found');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show.ejs', { campground });
}));

// EDIT PAGE
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'No campground found');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit.ejs', { campground });
}));

// "EDIT PAGE" FORM SUBMISSION 
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`)
}));

// "DELETE PAGE" FORM SUBMISSION
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground!')
    res.redirect('/campgrounds')
}));

module.exports = router;