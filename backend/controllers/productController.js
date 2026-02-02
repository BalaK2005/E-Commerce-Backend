const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middlewares/catchAsyncError');
const APIFeatures = require('../utils/apifeatures');

// Get Products - /api/v1/products
exports.getProducts = async (req, res, next)=>{
    const resPerPage = 3;
    // const apiFeatures = new APIFeatures(Product.find(), req.query).search().filter().paginate(resPerPage);

    let buildQuery = () => {
        return new APIFeatures(Product.find(), req.query).search().filter();
    }

    const filteredProductsCount = await buildQuery().query.countDocuments({})
    const totalProductsCount = await Product.countDocuments({});
    let productsCount = totalProductsCount;

    if(filteredProductsCount !== totalProductsCount) {
        productsCount = filteredProductsCount;
    }


    const products = await buildQuery().paginate(resPerPage).query;
   
    // await new Promise(resolve => setTimeout(resolve, 4000))
    res.status(200).json({
        success : true,
        count : productsCount,
        resPerPage,
        products
    })
}

// Create Product - /api/v1/product/new
exports.newProduct = catchAsyncError(async (req, res, next)=> {

    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({
        success : true,
        product
    })
})

// Get Single Product - /api/v1/product/:id
exports.getSingleProduct = async(req, res, next)=> {
    const product = await Product.findById(req.params.id);

    if(!product){
      return next(new ErrorHandler("Product not found", 400));
    }

    res.status(200).json({
        success : true,
        product
    })
}

//Update Product - /api/v1/product/:id
exports.updateProduct = async (req, res, next)=> {
    let product = await Product.findById(req.params.id);

    if(!product){
        return res.status(404).json({
            success : false,
            message : "Product not found"
        });
    }


    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new : true,
        runValidators : true
    })

    res.status(200).json({
        success : true,
        product
    })
}

// Delete Product - /api/v1/product/:id
exports.deleteProduct = async (req, res, next) => {
    const product = Product.findById(req.params.id);

    if(!product){
        return res.status(404).json({
            success : false,
            message : "Product not found"
        })
    }

    await product.deleteOne();

    res.status(200).json({
        success : true,
        message : "Product deleted successfully"
    })
} 

// Create Review - api/v1/review

exports.createReview = catchAsyncError(async (req, res, next) => {
    const {productId, rating, comment} = req.body;

    const review = {
        user : req.user.id,
        rating,
        comment
    }

    const product = await Product.findById(productId);
    // Finding user review exist
    const isReviewed = product.reviews.find(review => {
        return review.user.toString() == req.user.id.toString()
    })

    if(isReviewed){
        // Updating the review
        product.reviews.forEach(review => {
             if(review.user.toString() == req.user.id.toString()){
                review.comment = comment
                review.rating = rating
             }
        })
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    // find the average of the product reviews
    product.ratings = product.reviews.reduce((acc, review) => {
        return review.rating + acc;
    }, 0) / product.reviews.length;
    product.ratings = isNaN(product.ratings)?0:product.ratings;

    await product.save({validateBeforeSave : false});

    res.status(200).json({
        success : true
    })

});

// Get Reviews - api/v1/review?id={productId}
exports.getReviews = catchAsyncError(async (req, res, next) =>{
    const product = await Product.findById(req.query.id);

    res.status(200).json({
        success : true,
        reviews : product.reviews
    })
});

// Delete Review - api/v1/review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
     const product = await Product.findById(req.query.productId);

     // Filtering the reviews which does not match review id
     const reviews = product.reviews.filter(review => 
        review._id.toString() !== req.query.id.toString()
     );

     // Number Of Reviews
     const numOfReviews = reviews.length;

     // Finding the average with the filtered reviews
     let ratings =reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    // Save the product
    ratings = isNaN(ratings)?0:ratings;
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        numOfReviews,
        ratings
    })

    res.status(200).json({
        success : true
    });


});