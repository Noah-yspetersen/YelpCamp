const mongoose = require('mongoose');
const cities = require('./cities')
const Campground = require('../models/campground');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log('Database Connected!');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '633294e37827b59b052eee5b',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/ddjozh2j6/image/upload/v1664873489/YelpCamp/fwlhg2auys0akv5z5msl.png',
                    filename: 'YelpCamp/jnkwkth6ttphyezaddp6'
                },
                {
                    url: 'https://res.cloudinary.com/ddjozh2j6/image/upload/v1664873493/YelpCamp/d4vj2mwludi6xxavi48h.png',
                    filename: 'YelpCamp/d4vj2mwludi6xxavi48h'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi, non delectus! Quam facere itaque veritatis ipsum voluptatum ducimus molestiae ea sit! Error accusamus voluptatibus et aspernatur dolores. Vero, reiciendis at.',
            price: price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    db.close();
})