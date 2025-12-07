const User = require('../models/user')
const Course = require('../models/course')
const RatingAndReview = require('../models/ratingAndReview')
const mongoose = require('mongoose');

// ================ Create Rating ================
exports.createRating = async (req, res) => {
    try {
        const { rating, review, courseId } = req.body;
        const userId = req.user.id;

        if (!rating || !review || !courseId) {
            return res.status(401).json({
                success: false,
                message: "All fileds are required"
            });
        }

        const courseDetails = await Course.findOne({ _id: courseId },
            {
                studentsEnrolled: { $elemMatch: { $eq: userId } }
            });

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: 'Student is not enrolled in the course'
            });
        }

        const alreadyReviewd = await RatingAndReview.findOne(
            { course:courseId, user:userId }
        );

        if (alreadyReviewd) {
            return res.status(403).json({
                success: false,
                message: 'Course is already reviewed by the user'
            });
        }

        const ratingReview = await RatingAndReview.create({
            user:userId,
            course:courseId,
            rating,
            review,
            approved: false,
        });

        return res.status(200).json({
            success: true,
            data:ratingReview,
            message: "Recenzia ta a fost trimisă către administrator pentru aprobare",
        })
    }
    catch (error) {
        console.log('Error while creating rating and review');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while creating rating and review',
        })
    }
}

// ================ Get Average Rating ================
exports.getAverageRating = async (req, res) => {
    try {
            const courseId = req.body.courseId;

            const result = await RatingAndReview.aggregate([
                {
                    $match:{
                        course: new mongoose.Types.ObjectId(courseId),
                        approved: true,
                    },
                },
                {
                    $group:{
                        _id:null,
                        averageRating: { $avg: "$rating"},
                    }
                }
            ])

            if(result.length > 0) {

                return res.status(200).json({
                    success:true,
                    averageRating: result[0].averageRating,
                })

            }

            return res.status(200).json({
                success:true,
                message:'Average Rating is 0, no ratings given till now',
                averageRating:0,
            })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

// ================ Get All Rating And Reviews ================
exports.getAllRatingReview = async(req, res)=>{
    try{
        const allReviews = await RatingAndReview.find({ approved: true })
        .sort({rating:'desc'})
        .populate({
            path:'user',
            select:'firstName lastName email image'
        })
        .populate({
            path:'course',
            select:'courseName'
        })
        .exec();

        return res.status(200).json({
            success:true,
            data:allReviews,
            message:"All reviews fetched successfully"
        });
    }
    catch(error){
        console.log('Error while fetching all ratings');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while fetching all ratings',
        })
    }
}
