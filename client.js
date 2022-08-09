const HOST = "http://192.168.5.59:3000";

async function requestPeerConnection() {
    const response = await fetch(HOST + "/connections", { method: "GET" });
    const offer = await response.json();
    return offer;
}

document.addEventListener("DOMContentLoaded", () => {
    const remoteVideo = document.querySelector("video#example");
    remoteVideo.autoplay = true;
    remoteVideo.muted = true;

    const ondatachannel = (event) => {
      const dataChannel = event.channel;
      dataChannel.onopen = () => {
        console.log("dataChannel open");
      };
      dataChannel.onmessage = (event) => {
        console.log("dataChannel message:", event.data);
      };
    };
  
    const setup = async () => {
      const offer = await requestPeerConnection();
  
      const localPeerConnection = new RTCPeerConnection({
        sdpSemantics: 'unified-plan'
      });
      try {
        localPeerConnection.ondatachannel = ondatachannel;
        await localPeerConnection.setRemoteDescription(offer);
  
        console.log(localPeerConnection.getReceivers());
        const remoteStream = new MediaStream(localPeerConnection.getReceivers().map(receiver => receiver.track));
        remoteVideo.srcObject = remoteStream;
  
        const originalAnswer = await localPeerConnection.createAnswer();
        const updatedAnswer = new RTCSessionDescription({
          type: 'answer',
          sdp: originalAnswer.sdp
        });
        await localPeerConnection.setLocalDescription(updatedAnswer);
  
        const response = await fetch(HOST + "/remote-descriptions/", {
          method: "POST",
          body: JSON.stringify(localPeerConnection.localDescription),
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (exc) {
        localPeerConnection.close();
        throw exc;
      }
    };
    setup();
  });
  
