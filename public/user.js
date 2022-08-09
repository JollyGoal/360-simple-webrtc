const peerConnection = new RTCPeerConnection();
var dataChannel;


function createAnswerDone(answer) {
    console.log('createAnswerDone');
    const setLocalPromise = peerConnection.setLocalDescription(answer);
    setLocalPromise.then(lasticecandidate);
}
  

function lasticecandidate() {
    console.log('lasticecandidate');
    answer = peerConnection.localDescription
    console.log(JSON.stringify(answer));
  }

function setRemoteDone() {
    createAnswerPromise = peerConnection.createAnswer();
    createAnswerPromise.then(createAnswerDone);
}

function clickofferpasted(text) {
    peerConnection.ondatachannel = handledatachannel;
    const offer = JSON.parse(text);
    const setRemotePromise = peerConnection.setRemoteDescription(offer);
    setRemotePromise.then(setRemoteDone);
}


function datachannelopen() {
    console.log('datachannelopen');
}

function datachannelmessage(message) {
    console.log('datachannelmessage');
    console.log(message);
}
  
function handledatachannel(event) {
    console.log('handledatachannel');
    dataChannel = event.channel;
    dataChannel.onopen = datachannelopen;
    dataChannel.onmessage = datachannelmessage;
  }
  