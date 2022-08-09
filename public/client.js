// const HOST = "http://192.168.5.59:3000";

// async function requestPeerConnection() {
//   const response = await fetch(HOST + "/connections", { method: "GET" });
//   const offer = await response.json();
//   return offer;
// }

const ondatachannel = (event) => {
  const dataChannel = event.channel;
  dataChannel.onopen = () => {
    console.log("dataChannel open");
  };
  dataChannel.onmessage = (event) => {
    console.log("dataChannel message:", event.data);
  };
};

function makeid(length = 10) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

const id = makeid();

document.addEventListener("DOMContentLoaded", () => {

  const remoteVideo = document.querySelector("video#example");

  const setup = async (offer) => {
    // const offer = await requestPeerConnection();

    const localPeerConnection = new RTCPeerConnection({
      sdpSemantics: 'unified-plan'
    });
    try {
      localPeerConnection.ondatachannel = ondatachannel;
      await localPeerConnection.setRemoteDescription(offer);

      console.log(localPeerConnection.getReceivers());
      const remoteStream = new MediaStream(localPeerConnection.getReceivers().map(receiver => receiver.track));
      remoteVideo.srcObject = remoteStream;
      // const playPromise = remoteVideo.play();

      // playPromise.then(() => {
      //   emits('onProgressRewind', true)
      // })
      //   .catch(() => {
      //     if (video.paused) {
      //       video.play()
      //       emits('onProgressRewind', true)
      //     }
      //   });


      const originalAnswer = await localPeerConnection.createAnswer();
      const updatedAnswer = new RTCSessionDescription({
        type: 'answer',
        sdp: originalAnswer.sdp
      });
      await localPeerConnection.setLocalDescription(updatedAnswer);

      // const response = await fetch(HOST + "/remote-descriptions/", {
      //   method: "POST",
      //   body: JSON.stringify(localPeerConnection.localDescription),
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // });
      ws.send(JSON.stringify({ id, answer: localPeerConnection.localDescription }));
    } catch (exc) {
      localPeerConnection.close();
      throw exc;
    }
  };

  const onmessage = (event) => {
    const offer = JSON.parse(event.data);
    console.log("offer:", offer);
    setup(offer)
  }
  const ws = new WebSocket('ws://192.168.5.59:8080');
  ws.onopen = function () {
    ws.send(JSON.stringify({ id }));
    ws.onmessage = onmessage
  };
});

