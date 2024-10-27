const ImageKit = require("imagekit");
const Chat = require("../models/chat");
const UserChats = require("../models/userChats");


const imagekit = new ImageKit({
	publicKey: process.env.IMAGE_KIT_PUBLICKEY,
	privateKey: process.env.IMAGE_KIT_PRIVATEKEY,
	urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  });

  const imageUpload = (req, res) =>{
	const result = imagekit.getAuthenticationParameters();
  	res.send(result);
}

const chat = async (req, res) =>{
	const username = req.devs.username;
	const {text} = req.body;
	try {
		// Create a new chat entry
		const newChat = new Chat({
		  username: username,
		  history: [{ role: "user", parts: [{ text }] }],
		});
		const savedChat = await newChat.save();
	
		// Check if the user already has a UserChats entry
		const userChats = await UserChats.find({ username: username });
	
		if (!userChats.length) {
		  // Create a new UserChats document
		  const newUserChats = new UserChats({
			username: username,
			chats: [{ _id: savedChat._id, title: text.substring(0, 40) }],
		  });
		  await newUserChats.save();
		} else {
		  // Update the existing UserChats with the new chat
		  await UserChats.updateOne(
			{ username: username },
			{
			  $push: {
				chats: { _id: savedChat._id, title: text.substring(0, 40) },
			  },
			}
		  );
		}
		res.status(201).send(newChat._id);
	  } catch (error) {
		console.log(error);
		res.status(500).send("Error creating chat!");
	  }
	
}

const userChats = async (req, res) => {
	const username = req.devs.username;
	try {
		const userChats = await UserChats.find({username});

		res.status(200).send(userChats[0].chats);

	} catch (error) {
		console.log(error);
		res.status(500).send("Error fetching Userchats!");
	}
}

const chats = async (req, res) => {
	const username = req.devs.username;
	try {
		const chats = await Chat.findOne({_id:req.params.id ,username});

		res.status(200).send(chats);

	} catch (error) {
		console.log(error);
		res.status(500).send("Error fetching chats!");
	}
}

const updateChats = async (req, res) => {
	const username = req.devs.username;

	const { question, answer, img } = req.body;

	const newItems = [
		...(question
		  ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }]
		  : []),
		{ role: "model", parts: [{ text: answer }] },
	  ];
	try {
		const updatedChat = await Chat.updateOne({_id: req.params.id, username},{
			$push: {
				history:{
					$each: newItems
				}
			}
		}
	)
	res.status(200).send(updatedChat);
	
	} catch (error) {
		console.log(error);
		res.status(500).send("Error adding Conversations!");
	}
	
}

module.exports = {imageUpload, chat, userChats, chats, updateChats};
