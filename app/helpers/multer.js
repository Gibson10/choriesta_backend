require("dotenv").config()
const path = require("path")
const multer = require("multer")


var storage = multer.diskStorage({
	filename: function (req, file, callback) {
		callback(null, Date.now() + file.originalname)

	},
})
var imageFilter = function (req, file, cb) {
	// accept image file(s) only
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4|pdf)$/i)) {
		return cb(new Error("Only image files are allowed!"), false)
	}
	cb(null, true)
}
var upload = multer({
	storage: storage,
	fileFilter: imageFilter,
}).single("file")



export default upload