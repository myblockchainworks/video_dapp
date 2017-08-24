var accounts;
var account;
var channelIndex;
function setStatus(message) {
  var status = document.getElementById("status");
  status.innerHTML = message;
};


function showUserDetail() {
  var receiver = Receiver.deployed();
  receiver.getReceiverDetail.call({from: account}).then(function(detail) {
    var firstName_element = document.getElementById("firstName");
    var lastName_element = document.getElementById("lastName");
    var email_element = document.getElementById("email");
    var myAddress_element = document.getElementById("myAddress");
    firstName_element.innerHTML = detail[0] + ' ' + detail[1];
    //lastName_element.innerHTML = detail[1];
    email_element.innerHTML = detail[2];
    myAddress_element.innerHTML = account;
  }).catch(function(e) {
    console.log(e);
    setStatus("Error getting user details; see log.");
  });
}

function addNewChannel() {
  var channelName = document.getElementById("channelName").value;
  var channelUrl = document.getElementById("channelUrl").value;
  var donorAddress = document.getElementById("donorAddress").value;
  var startDate = Date.parse(document.getElementById("startDate").value);
  var endDate = Date.parse(document.getElementById("endDate").value);
  var priceForDuration = parseInt(document.getElementById("priceForDuration").value);
  var priceForPost = parseInt(document.getElementById("priceForPost").value);

  if (channelName == '') {
    alert ("Channel Name is empty!");
    return;
  } else if (channelUrl == '') {
    alert ("Channel URL is empty!");
    return;
  } else if (donorAddress == '') {
    alert ("Donor is empty");
    return;
  } else if (isNaN(startDate)) {
    alert ("Contract Start Date is empty!");
    return;
  } else if (isNaN(endDate)) {
    alert ("Contract End Date is empty!");
    return;
  } else if (isNaN(priceForDuration)) {
    alert ("Price for duration is empty!");
    return;
  } else if (isNaN(priceForPost)){
    alert ("Price per post is empty");
    return;
  } else {
    var receiver = Receiver.deployed();
    receiver.createMyChannel(donorAddress, channelName, channelUrl, startDate, endDate, priceForDuration, priceForPost, {from: account, gas: 4712388}).then(function() {
      document.getElementById("channelName").value = '';
      document.getElementById("channelUrl").value = '';
      document.getElementById("donorAddress").value = '';
      document.getElementById("startDate").value = '';
      document.getElementById("endDate").value = '';
      document.getElementById("priceForDuration").value = '';
      document.getElementById("priceForPost").value = '';
      setStatus("New Channel Added!");
      listChannels();
    }).catch(function(e) {
      console.log(e);
      setStatus("Error in adding new channel. see log.");
    });
  }
}

function addNewPost() {
  var postName = document.getElementById("postName").value;
  var postUrl = document.getElementById("postUrl").value;
  var receiver = Receiver.deployed();
  if (postName == '') {
    alert ("Post Name is empty!");
    return;
  } else if (postUrl == '') {
    alert ("Post URL is empty!");
    return;
  } else {
    receiver.createMyPost(channelIndex, postName, postUrl, {from: account, gas: 4712388}).then(function() {
      document.getElementById("postName").value = '';
      document.getElementById("postUrl").value = '';
      setStatus("New Post Added!");
      listPosts();
    }).catch(function(e) {
      console.log(e);
      setStatus("Error in adding new post. see log.");
    });
  }
}

function formatDate(date) {
  var monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

function clearTable(){
   var table = document.getElementById("channels");
   var rowCount = table.rows.length;
   for (var i = 1; i < rowCount; i++) {
      table.deleteRow(1);
   }
}

function clearPostTable(){
   var table = document.getElementById("posts");
   var rowCount = table.rows.length;
   for (var i = 1; i < rowCount; i++) {
      table.deleteRow(1);
   }
}

function sendEmail(channelName){
  var email_element = document.getElementById("email");

  window.open('mailto:' + email_element.innerText + '?subject=Reg: ' + channelName);
}

function getChannelDetails(channelCount) {
  clearTable();
  var receiver = Receiver.deployed();
  var index = 1;
  var donorAddressElement = document.getElementById("donorAddressInput");
  if (donorAddressElement != undefined) {
    var donorAddress = donorAddressElement.value;
    if (donorAddress == '') {
      alert ("Donor address is empty");
      return;
    }
    for (var i = 0; i < channelCount; i++){
      receiver.getDonorChannelDetail.call(i, donorAddress, {from: donorAddress}).then(function(detail) {
        var table = document.getElementById("channels");
        var row = table.insertRow(index);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        var cell6 = row.insertCell(5);
        var cell7 = row.insertCell(6);

        cell1.innerHTML = (index++);
        cell2.innerHTML = detail[0];
        cell3.innerHTML = formatDate(new Date(parseInt(detail[1])));
        cell4.innerHTML = formatDate(new Date(parseInt(detail[2])));
        cell5.innerHTML = detail[3].valueOf() + ' ETH';
        cell6.innerHTML = detail[4].valueOf() + ' ETH';
        var actionButton = '';
        if (detail[5].valueOf() == 1) {
          actionButton = "<button onclick='cancelChannel("+(index-2)+", \""+detail[0]+"\")'>Cancel</button> <button onclick='viewChannelPosts("+(index-2)+", \""+detail[0]+"\", true)'>View</button> <button onclick='sendEmail(\""+detail[0]+"\")'>Send Mail</button>";
        } else {
          row.style.backgroundColor = "#ffc6c6";
          actionButton = "<button onclick='viewChannelPosts("+(index-2)+", \""+detail[0]+"\", false)'>View</button> <button onclick='sendEmail(\""+detail[0]+"\")'>Send Mail</button>";
        }
        cell7.innerHTML = actionButton;

      }).catch(function(e) {
        console.log(e);
        setStatus("Error getting channel detail; see log.");
      });
    }
  } else {
    for (var i = 0; i < channelCount; i++){
      receiver.getChannelDetail.call(i, {from: account}).then(function(detail) {
        var table = document.getElementById("channels");
        var row = table.insertRow(index);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        var cell6 = row.insertCell(5);
        var cell7 = row.insertCell(6);
        var cell8 = row.insertCell(7);

        cell1.innerHTML = (index++);
        cell2.innerHTML = detail[0];
        cell3.innerHTML = detail[1];
        if (donorAddressElement != undefined) {
          cell3.style.display = 'none';
        }
        cell4.innerHTML = formatDate(new Date(parseInt(detail[2])));
        cell5.innerHTML = formatDate(new Date(parseInt(detail[3])));
        cell6.innerHTML = detail[4].valueOf() + ' ETH';
        cell7.innerHTML = detail[5].valueOf() + ' ETH';
        var actionButton = '';
        if (detail[6].valueOf() == 1) {
          actionButton = "<button onclick='cancelChannel("+(index-2)+", \""+detail[0]+"\")'>Cancel</button> <button onclick='viewChannelPosts("+(index-2)+", \""+detail[0]+"\", true)'>View</button> <button onclick='sendEmail(\""+detail[0]+"\")'>Send Mail</button>";
        } else {
          row.style.backgroundColor = "#ffc6c6";
          actionButton = "<button onclick='viewChannelPosts("+(index-2)+", \""+detail[0]+"\", false)'>View</button> <button onclick='sendEmail(\""+detail[0]+"\")'>Send Mail</button>";
        }
        cell8.innerHTML = actionButton;

      }).catch(function(e) {
        console.log(e);
        setStatus("Error getting channel detail; see log.");
      });
    }
  }

}

function cancelChannel(index, name) {
  var confirmation = confirm("Do you want to cancel the contract with donor for the channel '"+name+"'?");
  if (confirmation == true) {
    var receiver = Receiver.deployed();
    receiver.cancelContract(index, {from: account}).then(function() {
      setStatus("'" + name + "' channel is cancelled!");
      listChannels();
    }).catch(function(e) {
      console.log(e);
      setStatus("Error in cancelling contract. see log.");
    });

  } else {
    return false;
  }
}

function viewChannelPosts(index, name, showAdd) {
  var channelPage = document.getElementById("channelPage");
  var postPage = document.getElementById("postPage");
  var addNewPostDiv = document.getElementById("addNewPostDiv");
  var selectedChannelName = document.getElementById("selectedChannelName");
  selectedChannelName.innerHTML = name;
  channelPage.style.display = 'none';
  postPage.style.display = 'block';

  if(showAdd) {
    addNewPostDiv.style.display = 'block';
  } else {
    addNewPostDiv.style.display = 'none';
  }
  channelIndex = index;
  listPosts();
}

function showChannels() {
  var channelPage = document.getElementById("channelPage");
  var postPage = document.getElementById("postPage");
  channelPage.style.display = 'block';
  postPage.style.display = 'none';
  listChannels();
}

function listChannels() {
  var receiver = Receiver.deployed();
  receiver.getChannelCount.call({from: account}).then(function(value) {
    var channelCount_element = document.getElementById("channelCount");
    channelCount_element.innerHTML = value.valueOf();
    var donorAddressElement = document.getElementById("donorAddressInput");
    if (donorAddressElement != undefined) {
      var channelCountDiv = document.getElementById("channelCountDiv");
      channelCountDiv.style.display = 'none';
    }
    getChannelDetails(value.valueOf());
  }).catch(function(e) {
    console.log(e);
    setStatus("Error getting channel count; see log.");
  });
}

function listPosts() {
  var receiver = Receiver.deployed();
  receiver.getPostCount.call(channelIndex, {from: account}).then(function(value) {
    var postCount_element = document.getElementById("postCount");
    postCount_element.innerHTML = value.valueOf();
    getPostDetails(value.valueOf());
  }).catch(function(e) {
    console.log(e);
    setStatus("Error getting post count; see log.");
  });
}

function payForPostByDonor(index) {
  var receiver = Receiver.deployed();
  var donorAddressElement = document.getElementById("donorAddressInput");
  var donorAddress = donorAddressElement.value;
  receiver.updatePostPay(channelIndex, index, donorAddress, {from: account}).then(function() {
    setStatus("Paid for Post!");
    listPosts();
  }).catch(function(e) {
    console.log(e);
    setStatus("Error in paying for post; see log.");
  });
}

function getPostDetails(channelCount) {
  clearPostTable();
  var receiver = Receiver.deployed();
  var index = 1;
  for (var i = 0; i < channelCount; i++){
    receiver.getPostDetail.call(channelIndex, i, {from: account}).then(function(detail) {
      var table = document.getElementById("posts");
      var row = table.insertRow(index);
      var donorAddressElement = document.getElementById("donorAddressInput");
      if (donorAddressElement != undefined) {
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        cell1.innerHTML = (index++);
        cell2.innerHTML = detail[0];
        cell3.innerHTML = detail[1];
        var status = "Not Paid";
        var actionButton = "";
        if (detail[2]) {
          status = "Paid";
        } else {
          actionButton = "<button onclick='payForPostByDonor("+(index-2)+")'>Pay</button>";
        }
        cell4.innerHTML = status;
        cell5.innerHTML = actionButton;
      } else {
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        cell1.innerHTML = (index++);
        cell2.innerHTML = detail[0];
        cell3.innerHTML = detail[1];
        var status = "Not Received";
        if (detail[2]) {
          status = "Received";
        }
        cell4.innerHTML = status;

      }

    }).catch(function(e) {
      console.log(e);
      setStatus("Error getting post detail; see log.");
    });
  }
}

window.onload = function() {
  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;
    account = accounts[0];
    showUserDetail();
    listChannels();
  });
}
