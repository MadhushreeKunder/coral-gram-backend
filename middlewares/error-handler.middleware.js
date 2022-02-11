function errorHandler(err, req, res, next){
  console.error(err.stack)
  res.status(500).json({success: false, message: "Error occured, see errMessage key for more details", errorMessage: err.message})
}

module.exports = {errorHandler};