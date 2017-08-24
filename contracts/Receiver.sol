pragma solidity ^0.4.8;

// Base contract
contract UserBase {
	address public owner; // address of the user object

	function UserBase() {
		owner = msg.sender;
	}

	// modifier to allow only owner has full control on the function
	modifier onlyOwnder {
		if (msg.sender != owner) {
			throw;
		} else {
			_;
		}
	}

	// Delete / kill the contract... only the owner has rights to do this
	function kill() onlyOwnder {
		suicide(owner);
	}
}

// Donor contract
contract Donor is UserBase {
  string public firstName;
  string public lastName;
  string public email;
}

// Receiver contract
contract Receiver is UserBase {
  string public firstName;
  string public lastName;
  string public email;
	enum Status { Active, Cancelled }

	struct Post {
		string postName;
		string postUrl;
		Status status;
		uint postedDate;
		bool postPriceReceived;
		uint priceReceivedDate;
	}

	struct YoutubeChannel {
		address donor;
		address receiver;
		string channelName;
		string channelUrl;
		Status status;
		uint contractStartDate;
		uint contractEndDate;
		uint fixedPrice;
		uint pricePerPost;
		uint contractCancelledDate;
		address contractCancelledBy;
		Post[] myPosts;
	}

	YoutubeChannel[] public myChannels;

	function Receiver(string _firstName, string _lastName, string _email) {
		firstName = _firstName;
		lastName = _lastName;
		email = _email;
	}

	function getReceiverDetail() onlyOwnder public constant returns (string, string, string) {
		return (firstName, lastName, email);
	}

	function getChannelCount() public constant returns (uint) {
		return myChannels.length;
	}

	function createMyChannel(address _donor, string _name, string _url, uint _startDate, uint _endDate, uint _priceForDuration, uint _priceForPost) onlyOwnder {
			uint numChannels = myChannels.length++;
			myChannels[numChannels].donor = _donor;
			myChannels[numChannels].receiver = msg.sender;
			myChannels[numChannels].channelName = _name;
			myChannels[numChannels].channelUrl = _url;
			myChannels[numChannels].status = Status.Active;
			myChannels[numChannels].contractStartDate = _startDate;
			myChannels[numChannels].contractEndDate = _endDate;
			myChannels[numChannels].fixedPrice = _priceForDuration;
			myChannels[numChannels].pricePerPost = _priceForPost;
	}

	function cancelContract(uint channelIndex) onlyOwnder {
		if (myChannels.length > channelIndex && myChannels[channelIndex].status == Status.Active) {
			myChannels[channelIndex].status = Status.Cancelled;
			myChannels[channelIndex].contractCancelledDate = now;
			myChannels[channelIndex].contractCancelledBy = msg.sender;
		}
	}

	function getChannelDetail(uint channelIndex) public constant returns(string, address, uint, uint, uint, uint, int) {
		if (myChannels[channelIndex].status == Status.Active) {
			return (myChannels[channelIndex].channelName, myChannels[channelIndex].donor, myChannels[channelIndex].contractStartDate, myChannels[channelIndex].contractEndDate,	myChannels[channelIndex].fixedPrice, myChannels[channelIndex].pricePerPost, 1);
		} else {
			return (myChannels[channelIndex].channelName, myChannels[channelIndex].donor, myChannels[channelIndex].contractStartDate, myChannels[channelIndex].contractEndDate,	myChannels[channelIndex].fixedPrice, myChannels[channelIndex].pricePerPost, -1);
		}
	}

	function getDonorChannelDetail(uint channelIndex, address donor) public constant returns(string, uint, uint, uint, uint, int) {
		if (myChannels[channelIndex].donor == donor) {
			if (myChannels[channelIndex].status == Status.Active) {
				return (myChannels[channelIndex].channelName, myChannels[channelIndex].contractStartDate, myChannels[channelIndex].contractEndDate,	myChannels[channelIndex].fixedPrice, myChannels[channelIndex].pricePerPost, 1);
			} else {
				return (myChannels[channelIndex].channelName, myChannels[channelIndex].contractStartDate, myChannels[channelIndex].contractEndDate,	myChannels[channelIndex].fixedPrice, myChannels[channelIndex].pricePerPost, -1);
			}
		} else {
			return ("", 0, 0, 0, 0, -1);
		}
	}

	function createMyPost(uint channelIndex, string _name, string _url) onlyOwnder {
		if (myChannels.length > channelIndex) {
			uint numPosts = myChannels[channelIndex].myPosts.length++;
			myChannels[channelIndex].myPosts[numPosts].postName = _name;
			myChannels[channelIndex].myPosts[numPosts].postUrl = _url;
			myChannels[channelIndex].myPosts[numPosts].status = Status.Active;
			myChannels[channelIndex].myPosts[numPosts].postedDate = now;
			myChannels[channelIndex].myPosts[numPosts].postPriceReceived = false;
		}
	}

	function updatePostPay(uint channelIndex, uint postIndex, address _donor) onlyOwnder {
		if (myChannels.length > channelIndex && myChannels[channelIndex].donor == _donor) {
			if (_donor.send(myChannels[channelIndex].pricePerPost)) {
				myChannels[channelIndex].myPosts[postIndex].postPriceReceived = true;
				myChannels[channelIndex].myPosts[postIndex].postedDate = now;
				throw;
			} else {
				throw;
			}
		} else {
			throw;
		}
	}

	function getPostCount(uint channelIndex) public constant returns (uint) {
		if (myChannels.length > channelIndex) {
			return myChannels[channelIndex].myPosts.length;
		} else {
				return 0;
		}
	}

	function getPostDetail(uint channelIndex, uint postIndex) public constant returns (string, string, bool) {
		return (myChannels[channelIndex].myPosts[postIndex].postName, myChannels[channelIndex].myPosts[postIndex].postUrl, myChannels[channelIndex].myPosts[postIndex].postPriceReceived);
	}
}
