const mongoose = require('mongoose');
const User = require('./models/User');
const Donation = require('./models/Donation');
const Rating = require('./models/Rating');

async function testRating() {
  await mongoose.connect('mongodb://127.0.0.1:27017/smart-food-redistribution').catch(err => {
    // try fallback
    return mongoose.connect('mongodb://127.0.0.1:52134/sfd_test'); // using whatever port memory server uses
  });
  
  console.log("Connected to DB");
  
  // Create a donor
  const donor = await User.create({
    name: 'Donor Test', email: 'donor@test.com', password: 'password', role: 'donor'
  });
  
  // Create an NGO
  const ngo = await User.create({
    name: 'NGO Test', email: 'ngo@test.com', password: 'password', role: 'ngo'
  });
  
  // Create a donation
  const donation = await Donation.create({
    donor: donor._id,
    foodName: 'Test Food',
    quantity: '5',
    status: 'delivered',
    acceptedBy: ngo._id
  });
  
  console.log("Created donation:", donation._id);
  
  // Now simulate submitRating logic!
  const req = {
    user: { id: ngo._id.toString() },
    body: {
      donationId: donation._id.toString(),
      toUser: donor._id.toString(),
      rating: 5,
      feedback: 'Great!',
      tags: ['fresh_food']
    }
  };
  
  const { donationId, toUser, rating, feedback, tags } = req.body;
  
  const d = await Donation.findById(donationId)
      .populate('donor', 'name role')
      .populate('acceptedBy', 'name role');
      
  const isDonor = d.donor._id.toString() === req.user.id;
  const isNgo = d.acceptedBy?._id?.toString() === req.user.id;
  
  console.log("isDonor:", isDonor, "isNgo:", isNgo);
  
  let ratingType;
  if (isNgo && toUser === d.donor._id.toString()) {
    ratingType = 'ngo_to_donor';
  } else if (isDonor && toUser === d.acceptedBy?._id?.toString()) {
    const ratedUser = await User.findById(toUser);
    ratingType = ratedUser?.role === 'volunteer' ? 'donor_to_volunteer' : 'donor_to_ngo';
  } else {
    throw new Error('Invalid rating target');
  }
  
  console.log("Rating Type:", ratingType);
  
  try {
    const newRating = await Rating.create({
      donationId,
      fromUser: req.user.id,
      toUser,
      rating,
      feedback,
      ratingType,
      tags: tags || []
    });
    console.log("Rating created:", newRating._id);
  } catch (err) {
    console.error("Error creating rating:", err);
  }
  
  process.exit(0);
}

testRating().catch(console.error);
