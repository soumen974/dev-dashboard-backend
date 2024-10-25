const ImageKit = require("imagekit");



const imagekit = new ImageKit({
	publicKey: process.env.IMAGE_KIT_PUBLICKEY,
	privateKey: process.env.IMAGE_KIT_PRIVATEKEY,
	urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  });

  const imageUpload = (req, res) =>{
	const result = imagekit.getAuthenticationParameters();
  	res.send(result);
}

module.exports = {imageUpload};
